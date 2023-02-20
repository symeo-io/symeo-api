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
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { base64encode } from 'nodejs-base64';

describe('ValuesController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
  let apiKeyRepository: Repository<ApiKeyEntity>;
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
        .get(`/api/v1/values`)
        // Then
        .expect(403);
    });

    it('should respond 403 with invalid api key', () => {
      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/api/v1/values`)
        .set('X-API-KEY', 'abc123')
        // Then
        .expect(403);
    });

    it('should respond 403 with non existing key', async () => {
      const keySalt = base64encode(await bcrypt.genSalt(1));
      const keyBody = 'keyBody';

      const apiKey = `${keySalt}.${keyBody}`;

      // Given
      appClient
        .request(currentUser)
        // When
        .get(`/api/v1/values`)
        .set('X-API-KEY', apiKey)
        // Then
        .expect(403);
    });

    it('should respond 200 with matching key', async () => {
      const apiKey = await ApiKey.buildForEnvironmentId(uuid());
      const apiKeyEntity = ApiKeyEntity.fromDomain(apiKey);

      await apiKeyRepository.save(apiKeyEntity);

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
        .get(`/api/v1/values`)
        .set('X-API-KEY', apiKey.key ?? '')
        // Then
        .expect(200)
        .expect({ values: { aws: { region: 'eu-west-3' } } });
    });
  });
});
