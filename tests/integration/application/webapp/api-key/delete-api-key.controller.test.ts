import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import Environment from 'src/domain/model/environment/environment.model';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ApiKeyController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
  let apiKeyRepository: Repository<ApiKeyEntity>;
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
    apiKeyRepository = appClient.module.get<Repository<ApiKeyEntity>>(
      getRepositoryToken(ApiKeyEntity),
    );
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationRepository.delete({});
    await apiKeyRepository.delete({});
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

  describe('(DELETE) /configurations/github/:repositoryVcsId/:id/environments/:environmentId/api-keys/:apiKeyId', () => {
    it('should respond 404 with unknown configuration id', () => {
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

      appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${uuid()}/api-keys/${uuid()}`,
        )
        // Then
        .expect(404);
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
      configuration.configFormatFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), 'red'),
        ),
      ];

      await configurationRepository.save(configuration);

      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${
            configuration.environments[0].id
          }/api-keys/${uuid()}`,
        )
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown environment id', async () => {
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
      configuration.configFormatFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();
      configuration.environments = [];

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

      appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${uuid()}/api-keys/${uuid()}`,
        )
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown apiKey id', async () => {
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
      configuration.configFormatFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), 'red'),
        ),
      ];

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

      appClient
        .request(currentUser)
        // When
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${
            configuration.environments[0].id
          }/api-keys/${uuid()}`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 with api-keys', async () => {
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
      configuration.configFormatFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), 'red'),
        ),
      ];
      const apiKey = new ApiKeyEntity();
      apiKey.id = uuid();
      apiKey.environmentId = configuration.environments[0].id;
      apiKey.key = uuid();

      await configurationRepository.save(configuration);
      await apiKeyRepository.save(apiKey);

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

      await appClient
        .request(currentUser)
        .delete(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/api-keys/${apiKey.id}`,
        )
        .expect(200);

      const deletedApiKey = await apiKeyRepository.findOneBy({
        id: apiKey.id,
      });

      expect(deletedApiKey).toBeNull();
    });
  });
});
