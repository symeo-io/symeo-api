import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
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
  let checkFileExistsOnBranchMock: SpyInstance;

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
    checkFileExistsOnBranchMock = jest.spyOn(githubClient.repos, 'getContent');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    checkFileExistsOnBranchMock.mockRestore();
    githubClientRequestMock.mockRestore();
  });

  describe('(GET) /github/validate', () => {
    it('should respond false with unknown repository id', async () => {
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
        .post(`/api/v1/configurations/github/validate`)
        .send({
          repositoryVcsId,
          contractFilePath: 'symeo.config.yml',
          branch: 'staging',
        })
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(false);
    });

    it('should respond false for non existing file', async () => {
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
      checkFileExistsOnBranchMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/validate`)
        .send({
          repositoryVcsId,
          contractFilePath: 'symeo.config.yml',
          branch: 'staging',
        })
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(false);
    });

    it('should respond true for existing file', async () => {
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
      checkFileExistsOnBranchMock.mockImplementation(() =>
        Promise.resolve({ status: 200 as const }),
      );

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github/validate`)
        .send({
          repositoryVcsId,
          contractFilePath: 'symeo.config.yml',
          branch: 'staging',
        })
        // Then
        .expect(200);

      expect(response.body.isValid).toEqual(true);
    });
  });
});
