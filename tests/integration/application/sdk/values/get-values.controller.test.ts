import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import ApiKey from 'src/domain/model/environment/api-key.model';
import * as bcrypt from 'bcrypt';
import { base64encode } from 'nodejs-base64';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { ApiKeyTestUtil } from 'tests/utils/entities/api-key.test.util';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchSecretMock: FetchSecretMock;
  let apiKeyTestUtil: ApiKeyTestUtil;

  const currentUser = new User(
    `github|${faker.datatype.number()}`,
    faker.internet.email(),
    faker.internet.userName(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchSecretMock = new FetchSecretMock(appClient);
    apiKeyTestUtil = new ApiKeyTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await apiKeyTestUtil.empty();
  });

  afterEach(() => {
    fetchSecretMock.restore();
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

      await apiKeyTestUtil.repository.save(apiKeyEntity);

      fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });

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
