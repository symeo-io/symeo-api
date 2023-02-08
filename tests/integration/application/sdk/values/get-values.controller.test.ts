import { v4 as uuid } from 'uuid';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import { base64encode } from 'nodejs-base64';
import ApiKeyEntity from 'src/infrastructure/dynamodb-adapter/entity/api-key.entity';
import ApiKey from 'src/domain/model/configuration/api-key.model';

describe('ValuesController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
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
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientRequestMock.mockRestore();
    secretManagerClientGetSecretMock.mockRestore();
  });

  describe('(GET) /values', () => {
    it('should respond 403 with no api key', () => {
      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        // Then
        .expect(403);
    });

    it('should respond 403 with invalid api key', () => {
      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        .set('X-API-KEY', 'abc123')
        // Then
        .expect(403);
    });

    it('should respond 403 with empty key header', () => {
      const keyHeader = base64encode(JSON.stringify({}));
      const keyBody = 'invalidBody';

      const apiKey = `${keyHeader}.${keyBody}`;

      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        .set('X-API-KEY', apiKey)
        // Then
        .expect(403);
    });

    it('should respond 403 with non existing key', () => {
      const keyHeader = base64encode(
        JSON.stringify({
          id: uuid(),
          environmentId: uuid(),
        }),
      );
      const keyBody = 'keyBody';

      const apiKey = `${keyHeader}.${keyBody}`;

      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        .set('X-API-KEY', apiKey)
        // Then
        .expect(403);
    });

    it('should respond 403 with non matching key', async () => {
      const apiKey = new ApiKeyEntity();
      apiKey.id = uuid();
      apiKey.environmentId = uuid();
      apiKey.rangeKey = apiKey.id;
      apiKey.hashKey = apiKey.environmentId;
      apiKey.key = ApiKey.generateKey(apiKey.id, apiKey.environmentId);

      await dynamoDBTestUtils.put(apiKey);

      const keyHeader = base64encode(
        JSON.stringify({
          id: apiKey.id,
          environmentId: apiKey.environmentId,
        }),
      );
      const keyBody = 'invalidBody';

      const sentApiKey = `${keyHeader}.${keyBody}`;

      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        .set('X-API-KEY', sentApiKey)
        // Then
        .expect(403);
    });

    it('should respond 200 with matching key', async () => {
      const apiKey = new ApiKeyEntity();
      apiKey.id = uuid();
      apiKey.environmentId = uuid();
      apiKey.rangeKey = apiKey.id;
      apiKey.hashKey = apiKey.environmentId;
      apiKey.key = ApiKey.generateKey(apiKey.id, apiKey.environmentId);

      await dynamoDBTestUtils.put(apiKey);

      const mockGetSecretResponse = {
        SecretString: '{ "aws": { "region": "eu-west-3" } }',
      };

      secretManagerClientGetSecretMock.mockImplementation(() => ({
        promise: () => Promise.resolve(mockGetSecretResponse),
      }));

      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/values`)
        .set('X-API-KEY', apiKey.key)
        // Then
        .expect(200)
        .expect({ values: { aws: { region: 'eu-west-3' } } });
    });
  });
});
