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
import { AnalyticsReadValuesTestUtil } from 'tests/utils/entities/analytics-read-values.test.util';
import { wait } from 'tests/utils/wait.util';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchSecretMock: FetchSecretMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let apiKeyTestUtil: ApiKeyTestUtil;
  let analyticsReadValuesTestUtil: AnalyticsReadValuesTestUtil;

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
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    apiKeyTestUtil = new ApiKeyTestUtil(appClient);
    analyticsReadValuesTestUtil = new AnalyticsReadValuesTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await apiKeyTestUtil.empty();
    await analyticsReadValuesTestUtil.empty();
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
      const configuration = await configurationTestUtil.createConfiguration(
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      const apiKey = await ApiKey.buildForEnvironmentId(environment.id);
      const apiKeyEntity = ApiKeyEntity.fromDomain(apiKey);

      await apiKeyTestUtil.repository.save(apiKeyEntity);

      fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });

      // Given
      await appClient
        .request(currentUser)
        // When
        .get(`/api/v1/values`)
        .set('X-API-KEY', apiKey.key ?? '')
        // Then
        .expect(200)
        .expect({ values: { aws: { region: 'eu-west-3' } } });

      // Waiting since analytics writing is asynchronous
      await wait(1000);

      const foundAnalyticsLines =
        await analyticsReadValuesTestUtil.repository.findBy({
          environmentId: environment.id,
        });

      expect(foundAnalyticsLines.length).toEqual(1);
    });
  });
});
