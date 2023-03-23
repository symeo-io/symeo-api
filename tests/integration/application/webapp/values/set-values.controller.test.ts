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
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let updateSecretMock: UpdateSecretMock;
  let createSecretMock: CreateSecretMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  const userVcsId = faker.datatype.number();
  const currentUser = new User(
    `github|${userVcsId}`,
    faker.internet.email(),
    faker.internet.userName(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
    updateSecretMock = new UpdateSecretMock(appClient);
    createSecretMock = new CreateSecretMock(appClient);
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
    await environmentPermissionTestUtil.empty();
    await environmentAuditTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchSecretMock.restore();
    updateSecretMock.restore();
    createSecretMock.restore();
    appClient.mockReset();
  });

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/values', () => {
    it('should return 403 for current user without write permission', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.id,
        VcsRepositoryRole.ADMIN,
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
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
      const environmentAuditEntities: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntities.length).toEqual(0);
    });

    it('should update secret if it exists for full values replacement', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.id,
        VcsRepositoryRole.ADMIN,
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
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
      updateSecretMock.mock();

      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.repositoryVcsId,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );

      const sentValues = {
        aws: {
          region: faker.datatype.string(),
          user: faker.datatype.string(),
        },
        database: {
          postgres: {
            host: faker.datatype.string(),
            port: faker.datatype.number(),
            password: faker.datatype.string(),
            type: faker.datatype.string(),
          },
        },
      };

      await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(2);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(updateSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(updateSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
        SecretString: JSON.stringify(sentValues),
      });

      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(1);
      expect(environmentAuditEntity[0].id).toBeDefined();
      expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
      );
      expect(environmentAuditEntity[0].eventType).toEqual(
        EnvironmentAuditEventType.VALUES_UPDATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          environmentName: environment.name,
          updatedProperties: [
            'aws.region',
            'aws.user',
            'database.postgres.host',
            'database.postgres.port',
            'database.postgres.password',
            'database.postgres.type',
          ],
        },
      });
    });

    it('should update secret if it exists for partial values replacement', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.id,
        VcsRepositoryRole.ADMIN,
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
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
      updateSecretMock.mock();

      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.repositoryVcsId,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );

      const sentValues = {
        aws: {
          region: faker.datatype.string(),
        },
        database: {
          postgres: {
            host: faker.datatype.string(),
          },
        },
      };

      await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(2);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(updateSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(updateSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
        SecretString: JSON.stringify({
          aws: {
            region: sentValues.aws.region,
            user: 'fake-user',
          },
          database: {
            postgres: {
              host: sentValues.database.postgres.host,
              port: 9999,
              password: 'password',
              type: 'postgres',
            },
          },
        }),
      });
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(1);
      expect(environmentAuditEntity[0].id).toBeDefined();
      expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
      );
      expect(environmentAuditEntity[0].eventType).toEqual(
        EnvironmentAuditEventType.VALUES_UPDATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          environmentName: environment.name,
          updatedProperties: ['aws.region', 'database.postgres.host'],
        },
      });
    });

    it('should create secret if it does not exists', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.id,
        VcsRepositoryRole.ADMIN,
      );
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.repositoryVcsId,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.yml',
      );
      fetchSecretMock.mockSecretMissing();
      createSecretMock.mock();

      fetchVcsFileMock.mockSymeoContractFilePresent(
        configuration.repositoryVcsId,
        configuration.contractFilePath,
        './tests/utils/stubs/configuration/symeo.config.secret.yml',
      );

      const sentValues = {
        aws: {
          region: faker.datatype.string(),
        },
        database: {
          postgres: {
            host: faker.datatype.string(),
          },
        },
      };

      await appClient
        .request(currentUser)
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/values`,
        )
        .send({ values: sentValues })
        .expect(200);

      expect(fetchSecretMock.spy).toHaveBeenCalledTimes(2);
      expect(fetchSecretMock.spy).toHaveBeenCalledWith({
        SecretId: environment.id,
      });
      expect(createSecretMock.spy).toHaveBeenCalledTimes(1);
      expect(createSecretMock.spy).toHaveBeenCalledWith({
        Name: environment.id,
        SecretString: JSON.stringify(sentValues),
      });

      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(1);
      expect(environmentAuditEntity[0].id).toBeDefined();
      expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
      );
      expect(environmentAuditEntity[0].eventType).toEqual(
        EnvironmentAuditEventType.VALUES_UPDATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          environmentName: environment.name,
          updatedProperties: ['aws.region', 'database.postgres.host'],
        },
      });
    });
  });
});
