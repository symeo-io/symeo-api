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

  describe('(GET) /configurations/github/:repositoryVcsId', () => {
    it('should respond 404 with unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration1 = new ConfigurationEntity();
      configuration1.id = uuid();
      configuration1.name = faker.name.jobTitle();
      configuration1.ownerVcsName = 'symeo-io';
      configuration1.ownerVcsId = faker.datatype.number();
      configuration1.repositoryVcsName = 'symeo-api';
      configuration1.repositoryVcsId = faker.datatype.number();
      configuration1.contractFilePath = 'symeo.config.yml';
      configuration1.branch = 'staging';

      const configuration2 = new ConfigurationEntity();
      configuration2.id = uuid();
      configuration2.name = faker.name.jobTitle();
      configuration2.ownerVcsName = 'symeo-io';
      configuration2.ownerVcsId = faker.datatype.number();
      configuration2.repositoryVcsName = 'symeo-api';
      configuration2.repositoryVcsId = faker.datatype.number();
      configuration2.contractFilePath = 'symeo.config.yml';
      configuration2.branch = 'staging';

      await Promise.all([
        configurationRepository.save(configuration1),
        configurationRepository.save(configuration2),
      ]);

      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .get(`/api/v1/configurations/github/${repositoryVcsId}`)
        // Then
        .expect(404);
    });

    it('should respond 200 with known repository and id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration1 = new ConfigurationEntity();
      configuration1.id = uuid();
      configuration1.name = faker.name.jobTitle();
      configuration1.ownerVcsName = 'symeo-io';
      configuration1.ownerVcsId = faker.datatype.number();
      configuration1.repositoryVcsName = 'symeo-api';
      configuration1.repositoryVcsId = repositoryVcsId;
      configuration1.contractFilePath = 'symeo.config.yml';
      configuration1.branch = 'staging';

      const configuration2 = new ConfigurationEntity();
      configuration2.id = uuid();
      configuration2.name = faker.name.jobTitle();
      configuration2.ownerVcsName = 'symeo-io';
      configuration2.ownerVcsId = faker.datatype.number();
      configuration2.repositoryVcsName = 'symeo-api';
      configuration2.repositoryVcsId = repositoryVcsId;
      configuration2.contractFilePath = 'symeo.config.yml';
      configuration2.branch = 'staging';

      await Promise.all([
        configurationRepository.save(configuration1),
        configurationRepository.save(configuration2),
      ]);

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
        .get(`/api/v1/configurations/github/${repositoryVcsId}`)
        .expect(200);

      expect(response.body.configurations).toBeDefined();
      expect(response.body.configurations.length).toEqual(2);
    });
  });
});
