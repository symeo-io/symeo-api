import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { UpdateSecretMock } from 'tests/utils/mocks/update-secret.mock';
import { CreateSecretMock } from 'tests/utils/mocks/create-secret.mock';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let updateSecretMock: UpdateSecretMock;
  let createSecretMock: CreateSecretMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    updateSecretMock = new UpdateSecretMock(appClient);
    createSecretMock = new CreateSecretMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchSecretMock.restore();
    updateSecretMock.restore();
    createSecretMock.restore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    it('should update secret if it exists', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });
      updateSecretMock.mock();

      const sentValues = { aws: { region: 'eu-west-3' } };
      await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(updateSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(updateSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
        SecretString: JSON.stringify(sentValues),
      });
    });

    it('should create secret if it does not exists', async () => {
      // Given
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchSecretMock.mockSecretMissing();
      createSecretMock.mock();

      const sentValues = { aws: { region: 'eu-west-3' } };
      await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(createSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(createSecretMock.spy).toHaveBeenCalledWith({
        Name: environment.id,
        SecretString: JSON.stringify(sentValues),
      });
    });
  });
});
