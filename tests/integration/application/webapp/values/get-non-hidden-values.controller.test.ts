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
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentPermissionTestUtil = new EnvironmentPermissionTestUtil(
      appClient,
    );
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentAuditTestUtil.empty();
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
        const environmentAuditEntities: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntities.length).toEqual(0);
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

        fetchVcsFileMock.mockSymeoContractFilePresent(
          configuration.ownerVcsName,
          configuration.repositoryVcsName,
          configuration.contractFilePath,
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
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          vcsRepositoryId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.SECRETS_READ,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            environmentName: environment.name,
            readProperties: ['aws.region', 'database.postgres.password'],
          },
        });
      });

      it('should respond 200 and return non hidden values for inBase write user given specific versionId', async () => {
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

        fetchVcsFileMock.mockSymeoContractFilePresent(
          configuration.ownerVcsName,
          configuration.repositoryVcsName,
          configuration.contractFilePath,
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

        const versionId = faker.datatype.uuid();
        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets?versionId=${versionId}`,
          )
          // Then
          .expect(200);

        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: versionId,
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
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          vcsRepositoryId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.SECRETS_READ,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            environmentName: environment.name,
            readProperties: ['aws.region', 'database.postgres.password'],
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
        const environmentAuditEntities: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntities.length).toEqual(0);
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

        fetchVcsFileMock.mockSymeoContractFilePresent(
          configuration.ownerVcsName,
          configuration.repositoryVcsName,
          configuration.contractFilePath,
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
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          vcsRepositoryId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.SECRETS_READ,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            environmentName: environment.name,
            readProperties: ['aws.region', 'database.postgres.password'],
          },
        });
      });

      it('should respond 200 and return non hidden values for github admin user mapped to admin symeoUser given specific versionId', async () => {
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

        fetchVcsFileMock.mockSymeoContractFilePresent(
          configuration.ownerVcsName,
          configuration.repositoryVcsName,
          configuration.contractFilePath,
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

        const versionId = faker.datatype.uuid();

        // When
        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values/secrets?versionId=${versionId}`,
          )
          // Then
          .expect(200);
        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: versionId,
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
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          vcsRepositoryId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.SECRETS_READ,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            environmentName: environment.name,
            readProperties: ['aws.region', 'database.postgres.password'],
          },
        });
      });
    });
  });
});
