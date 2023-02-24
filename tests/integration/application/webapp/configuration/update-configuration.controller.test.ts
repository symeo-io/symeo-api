import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
    configurationRepository = appClient.module.get<
      Repository<ConfigurationEntity>
    >(getRepositoryToken(ConfigurationEntity));
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationRepository.delete({});
    githubClientRequestMock = jest.spyOn(githubClient, 'request');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientRequestMock.mockRestore();
  });

  describe('(PATCH) /configurations/github/:repositoryVcsId/:configurationId', () => {
    it('should respond 404 with unknown configuration id', async () => {
      // Given
      const configurationId = uuid();
      const repositoryVcsId = 105865802;
      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          name: 'symeo-api',
          id: repositoryVcsId,
          owner: { login: 'symeo-io', id: 585863519 },
        },
      };
      githubClientRequestMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const response = await appClient
        .request(currentUser)
        // When
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}`,
        )
        .send({
          name: faker.datatype.string(),
          contractFilePath: faker.datatype.string(),
          branch: faker.datatype.string(),
        })
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    });

    it('should respond 404 with unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.name = faker.name.jobTitle();
      configuration.repositoryVcsId = repositoryVcsId;
      configuration.vcsType = VCSProvider.GitHub;
      configuration.repositoryVcsName = 'symeo-api';
      configuration.ownerVcsId = faker.datatype.number();
      configuration.ownerVcsName = 'symeo-io';
      configuration.contractFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();

      await configurationRepository.save(configuration);

      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const response = await appClient
        .request(currentUser)
        // When
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}`,
        )
        .send({
          name: faker.datatype.string(),
          contractFilePath: faker.datatype.string(),
          branch: faker.datatype.string(),
        })
        // Then
        .expect(404);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    });

    it('should respond 200 with known repository and id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.name = faker.name.jobTitle();
      configuration.vcsType = VCSProvider.GitHub;
      configuration.repositoryVcsId = repositoryVcsId;
      configuration.repositoryVcsName = 'symeo-api';
      configuration.ownerVcsId = 585863519;
      configuration.ownerVcsName = 'symeo-io';
      configuration.contractFilePath = './symeo.config.yml';
      configuration.branch = 'staging';

      await configurationRepository.save(configuration);

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          name: 'symeo-api',
          id: repositoryVcsId,
          owner: { login: 'symeo-io', id: 585863519 },
        },
      };
      githubClientRequestMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const newValues = {
        name: faker.datatype.string(),
        contractFilePath: faker.datatype.string(),
        branch: faker.datatype.string(),
      };

      await appClient
        .request(currentUser)
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}`,
        )
        .send(newValues)
        .expect(200);

      const updatedConfiguration: ConfigurationEntity | null =
        await configurationRepository.findOneBy({
          id: configuration.id,
        });

      expect(updatedConfiguration).toBeDefined();
      expect(updatedConfiguration?.name).toEqual(newValues.name);
      expect(updatedConfiguration?.contractFilePath).toEqual(
        newValues.contractFilePath,
      );
      expect(updatedConfiguration?.branch).toEqual(newValues.branch);
    });
  });
});
