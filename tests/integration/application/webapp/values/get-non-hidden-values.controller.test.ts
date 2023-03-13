import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchSecretMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    describe('Tests for non-persisted user permission => default permission from github', () => {
      it('should respond 403 for inBase readNonSecret user', async () => {
        // Given
        const userVcsId = 102222086;
        const currentUser = new User(
          `github|${userVcsId}`,
          faker.internet.email(),
          faker.name.firstName(),
          VCSProvider.GitHub,
          faker.datatype.number(),
        );
        const vcsRepositoryId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.READ_NON_SECRET,
          userVcsId,
        );

        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets`,
          )
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
      });

      it('should respond 200 and return non hidden values for inBase write user', async () => {
        // Given
        const userVcsId = 102222086;
        const currentUser = new User(
          `github|${userVcsId}`,
          faker.internet.email(),
          faker.name.firstName(),
          VCSProvider.GitHub,
          faker.datatype.number(),
        );
        const vcsRepositoryId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.WRITE,
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

        fetchSecretMock.mockSecretPresent(configurationValues);

        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets`,
          )
          // Then
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
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
        });
      });
    });

    describe('Tests for non-persisted user permission => default permission from github', () => {
      it('should respond 403 for github write user mapped to readNonSecret symeoUser', async () => {
        // Given
        const userVcsId = 102222086;
        const currentUser = new User(
          `github|${userVcsId}`,
          faker.internet.email(),
          faker.name.firstName(),
          VCSProvider.GitHub,
          faker.datatype.number(),
        );
        const vcsRepositoryId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.owner.login,
          repository.name,
          VcsRepositoryRole.WRITE,
        );

        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets`,
          )
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
      });

      it('should respond 200 and return non hidden values for github admin user mapped to admin symeoUser', async () => {
        // Given
        const userVcsId = 102222086;
        const currentUser = new User(
          `github|${userVcsId}`,
          faker.internet.email(),
          faker.name.firstName(),
          VCSProvider.GitHub,
          faker.datatype.number(),
        );
        const vcsRepositoryId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.owner.login,
          repository.name,
          VcsRepositoryRole.ADMIN,
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

        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets`,
          )
          // Then
          .expect(200);
        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });
        expect(response.body.values).toEqual({
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
        });
      });
    });
  });
});
