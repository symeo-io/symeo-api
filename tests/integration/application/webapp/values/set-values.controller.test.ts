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
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let updateSecretMock: UpdateSecretMock;
  let createSecretMock: CreateSecretMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    updateSecretMock = new UpdateSecretMock(appClient);
    createSecretMock = new CreateSecretMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentPermissionTestUtil = new EnvironmentPermissionTestUtil(
      appClient,
    );
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentPermissionTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchSecretMock.restore();
    updateSecretMock.restore();
    createSecretMock.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    it('should return 403 for current user without write permission', async () => {
      // Given
      const userVcsId = 16590657;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      const environmentPermission =
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.READ_SECRET,
          userVcsId,
        );

      fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });
      updateSecretMock.mock();

      const sentValues = { aws: { region: 'eu-west-3' } };
      const response = await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(403);

      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
      expect(response.body.message).toBe(
        `User with userVcsId ${userVcsId} is trying to access resources he do not have permission for (minimum ${EnvironmentPermissionRole.WRITE} permission required)`,
      );
    });

    it('should update secret if it exists', async () => {
      // Given
      const currentUser = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
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
      const currentUser = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
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
