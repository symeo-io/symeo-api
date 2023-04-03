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
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { FetchSecretVersionMock } from 'tests/utils/mocks/fetch-secret-version.mock';

describe('ValuesController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let fetchSecretMock: FetchSecretMock;
  let updateSecretMock: UpdateSecretMock;
  let createSecretMock: CreateSecretMock;
  let fetchSecretVersionMock: FetchSecretVersionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    updateSecretMock = new UpdateSecretMock(appClient);
    createSecretMock = new CreateSecretMock(appClient);
    fetchSecretVersionMock = new FetchSecretVersionMock(appClient);
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
    fetchSecretVersionMock.restore();
    appClient.mockReset();
  });

  describe('(POST) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId/rollback/:versionId', () => {
    describe('With Github as VcsProvider', () => {
      const userVcsId = faker.datatype.number();
      const currentUser = new User(
        `github|${userVcsId}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should return 403 for current user without write permission', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
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
        const versionId = faker.datatype.uuid();

        fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });
        updateSecretMock.mock();

        const sentValues = { aws: { region: 'eu-west-3' } };
        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/rollback/${versionId}`,
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

      it('should return 404 for non existing version', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );

        const secretVersion = {
          CreatedDate: new Date(1980, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [],
        };

        fetchSecretVersionMock.mockSecretVersionPresent([secretVersion]);

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

        await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${
              configuration.id
            }/environments/${environment.id}/rollback/${faker.datatype.uuid()}`,
          )
          .expect(404);
      });

      it('should rollback values', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );

        const secretVersion = {
          CreatedDate: new Date(1980, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [],
        };

        fetchSecretVersionMock.mockSecretVersionPresent([secretVersion]);

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

        await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/rollback/${secretVersion.VersionId}`,
          )
          .expect(200);

        expect(fetchSecretVersionMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretVersionMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          IncludeDeprecated: true,
        });
        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(2);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: secretVersion.VersionId,
        });
        expect(updateSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(updateSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          SecretString: JSON.stringify(configurationValues),
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
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.VERSION_ROLLBACK,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            versionId: secretVersion.VersionId,
            versionCreationDate: secretVersion.CreatedDate.toISOString(),
          },
        });
      });
    });

    describe('With Gitlab as VcsProvider', () => {
      const userVcsId = faker.datatype.number();
      const currentUser = new User(
        `gitlab|${userVcsId}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should return 403 for current user without write permission', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
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
        const versionId = faker.datatype.uuid();

        fetchSecretMock.mockSecretPresent({ aws: { region: 'eu-west-3' } });
        updateSecretMock.mock();

        const sentValues = { aws: { region: 'eu-west-3' } };
        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/rollback/${versionId}`,
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

      it('should return 404 for non existing version', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );

        const secretVersion = {
          CreatedDate: new Date(1980, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [],
        };

        fetchSecretVersionMock.mockSecretVersionPresent([secretVersion]);

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

        await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${
              configuration.id
            }/environments/${environment.id}/rollback/${faker.datatype.uuid()}`,
          )
          .expect(404);
      });

      it('should rollback values', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );

        const secretVersion = {
          CreatedDate: new Date(1980, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [],
        };

        fetchSecretVersionMock.mockSecretVersionPresent([secretVersion]);

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

        await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/rollback/${secretVersion.VersionId}`,
          )
          .expect(200);

        expect(fetchSecretVersionMock.spy).toHaveBeenCalledTimes(1);
        expect(fetchSecretVersionMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          IncludeDeprecated: true,
        });
        expect(fetchSecretMock.spy).toHaveBeenCalledTimes(2);
        expect(fetchSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          VersionId: secretVersion.VersionId,
        });
        expect(updateSecretMock.spy).toHaveBeenCalledTimes(1);
        expect(updateSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
          SecretString: JSON.stringify(configurationValues),
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
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.VERSION_ROLLBACK,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            versionId: secretVersion.VersionId,
            versionCreationDate: secretVersion.CreatedDate.toISOString(),
          },
        });
      });
    });
  });
});
