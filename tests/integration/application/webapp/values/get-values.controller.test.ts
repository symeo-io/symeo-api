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
import Environment from 'src/domain/model/environment/environment.model';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ValuesController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let secretManagerClient: SecretManagerClient;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;
  let secretManagerClientGetSecretMock: SpyInstance;

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
    secretManagerClient = appClient.module.get<SecretManagerClient>(
      'SecretManagerClient',
    );
    configurationRepository = appClient.module.get<
      Repository<ConfigurationEntity>
    >(getRepositoryToken(ConfigurationEntity));
  });

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
    secretManagerClientGetSecretMock = jest.spyOn(
      secretManagerClient.client,
      'getSecretValue',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientRequestMock.mockRestore();
    secretManagerClientGetSecretMock.mockRestore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:id/environments/:environmentId/values', () => {
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
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${uuid()}/values`,
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
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/values`,
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
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${uuid()}/values`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 with values', async () => {
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

      const mockGetSecretResponse = {
        SecretString: '{ "aws": { "region": "eu-west-3" } }',
      };

      secretManagerClientGetSecretMock.mockImplementation(() => ({
        promise: () => Promise.resolve(mockGetSecretResponse),
      }));

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/values`,
        )
        .expect(200);

      expect(secretManagerClientGetSecretMock).toHaveBeenCalledTimes(1);
      expect(secretManagerClientGetSecretMock).toHaveBeenCalledWith({
        SecretId: configuration.environments[0].id,
      });
      expect(response.body.values).toBeDefined();
      expect(response.body.values.aws).toBeDefined();
      expect(response.body.values.aws.region).toEqual('eu-west-3');
    });
  });
});
