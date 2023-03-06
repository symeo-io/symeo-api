import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
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
    fetchVcsRepositoryCollaboratorsMock.restore();
    fetchVcsFileMock.restore();
    fetchUserVcsRepositoryPermissionMock.restore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    it('should respond 200 and return values for an in-base admin permission', async () => {
      // Given
      const requestedBranch = 'staging';
      const userVcsId = 102222086;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
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
          EnvironmentPermissionRole.ADMIN,
          userVcsId,
        );

      const configurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };
      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );
      fetchSecretMock.mockSecretPresent(configurationValues);

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
        )
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(response.body.values).toEqual(configurationValues);
    });

    it('should respond 200 and return values for an in-base ReadNonSecret permission (hide secrets)', async () => {
      // Given
      const requestedBranch = 'staging';
      const userVcsId = 102222086;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
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
          EnvironmentPermissionRole.READ_NON_SECRET,
          userVcsId,
        );

      const configurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };

      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );
      fetchSecretMock.mockSecretPresent(configurationValues);

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
        )
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(response.body.values).toEqual({
        aws: {
          region: '*********',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: '********',
            type: 'postgres',
          },
        },
      });
    });

    it('should respond 200 and return values for a github admin role', async () => {
      // Given
      const requestedBranch = 'staging';
      const userVcsId = 16590657;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
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

      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        VcsRepositoryRole.ADMIN,
      );

      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );

      const configurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };

      fetchSecretMock.mockSecretPresent(configurationValues);

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
        )
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(response.body.values).toEqual(configurationValues);
    });

    it('should respond 200 and return values for a github write role (hide secrets)', async () => {
      // Given
      const requestedBranch = 'staging';
      const userVcsId = 102222086;
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.name.firstName(),
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

      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        VcsRepositoryRole.READ,
      );

      fetchVcsFileMock.mockSymeoContractFilePresent(
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );

      const configurationValues: ConfigurationValues = {
        aws: {
          region: 'eu-west-3',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: 'password',
            type: 'postgres',
          },
        },
      };

      fetchSecretMock.mockSecretPresent(configurationValues);

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values?branch=${requestedBranch}`,
        )
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(response.body.values).toEqual({
        aws: {
          region: '*********',
          user: 'fake-user',
        },
        database: {
          postgres: {
            host: 'fake-host',
            port: 9999,
            password: '********',
            type: 'postgres',
          },
        },
      });
    });
  });
});
