import { v4 as uuid } from 'uuid';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';
import SpyInstance = jest.SpyInstance;
import EnvironmentEntity from 'src/infrastructure/dynamodb-adapter/entity/environment.entity';
import Environment from 'src/domain/model/environment/environment.model';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';

describe('ValuesController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let secretManagerClient: SecretManagerClient;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;
  let secretManagerClientGetSecretMock: SpyInstance;
  let secretManagerClientUpdateSecretMock: SpyInstance;
  let secretManagerClientCreateSecretMock: SpyInstance;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    dynamoDBTestUtils = new DynamoDbTestUtils();
    appClient = new AppClient();

    await appClient.init();

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
    secretManagerClient = appClient.module.get<SecretManagerClient>(
      'SecretManagerClient',
    );
  });

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await dynamoDBTestUtils.emptyTable(ConfigurationEntity);
    githubClientRequestMock = jest.spyOn(githubClient, 'request');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    secretManagerClientGetSecretMock = jest.spyOn(
      secretManagerClient.client,
      'getSecretValue',
    );
    secretManagerClientUpdateSecretMock = jest.spyOn(
      secretManagerClient.client,
      'putSecretValue',
    );
    secretManagerClientCreateSecretMock = jest.spyOn(
      secretManagerClient.client,
      'createSecret',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientRequestMock.mockRestore();
    secretManagerClientGetSecretMock.mockRestore();
    secretManagerClientUpdateSecretMock.mockRestore();
    secretManagerClientCreateSecretMock.mockRestore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:id/environments/:environmentId/values', () => {
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
        .post(
          `/configurations/github/${repositoryVcsId}/${configurationId}/environments/${uuid()}/values`,
        )
        .send({ values: { aws: { region: 'eu-west-3' } } })
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), EnvironmentColor.red),
        ),
      ];

      await dynamoDBTestUtils.put(configuration);

      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/values`,
        )
        .send({ values: { aws: { region: 'eu-west-3' } } })
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown environment id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.environments = [];

      await dynamoDBTestUtils.put(configuration);

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
        .post(
          `/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${uuid()}/values`,
        )
        .send({ values: { aws: { region: 'eu-west-3' } } })
        // Then
        .expect(404);
    });

    it('should update secret if it exists', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), EnvironmentColor.red),
        ),
      ];

      await dynamoDBTestUtils.put(configuration);

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
        SecretString: '{ "aws": { "region": "eu-west-1" } }',
      };

      secretManagerClientGetSecretMock.mockImplementation(() => ({
        promise: () => Promise.resolve(mockGetSecretResponse),
      }));

      secretManagerClientUpdateSecretMock.mockImplementation(() => ({
        promise: () => Promise.resolve(),
      }));

      const sentValues = { aws: { region: 'eu-west-3' } };
      await appClient
        .request(currentUser)
        .post(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(secretManagerClientGetSecretMock).toHaveBeenCalledTimes(1);
      expect(secretManagerClientGetSecretMock).toHaveBeenCalledWith({
        SecretId: configuration.environments[0].id,
      });
      expect(secretManagerClientUpdateSecretMock).toHaveBeenCalledTimes(1);
      expect(secretManagerClientUpdateSecretMock).toHaveBeenCalledWith({
        SecretId: configuration.environments[0].id,
        SecretString: JSON.stringify(sentValues),
      });
    });

    it('should create secret if it does not exists', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(uuid(), faker.name.firstName(), EnvironmentColor.red),
        ),
      ];

      await dynamoDBTestUtils.put(configuration);

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

      secretManagerClientGetSecretMock.mockImplementation(() => ({
        promise: () => {
          throw { code: 'ResourceNotFoundException' };
        },
      }));

      secretManagerClientCreateSecretMock.mockImplementation(() => ({
        promise: () => Promise.resolve(),
      }));

      const sentValues = { aws: { region: 'eu-west-3' } };
      await appClient
        .request(currentUser)
        .post(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${configuration.environments[0].id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(secretManagerClientGetSecretMock).toHaveBeenCalledTimes(1);
      expect(secretManagerClientGetSecretMock).toHaveBeenCalledWith({
        SecretId: configuration.environments[0].id,
      });
      expect(secretManagerClientCreateSecretMock).toHaveBeenCalledTimes(1);
      expect(secretManagerClientCreateSecretMock).toHaveBeenCalledWith({
        Name: configuration.environments[0].id,
        SecretString: JSON.stringify(sentValues),
      });
    });
  });
});
