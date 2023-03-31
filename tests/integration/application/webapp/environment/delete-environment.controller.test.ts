import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { DeleteSecretMock } from 'tests/utils/mocks/delete-secret.mock';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';

describe('EnvironmentController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let deleteSecretMock: DeleteSecretMock;
  let fetchSecretMock: FetchSecretMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    deleteSecretMock = new DeleteSecretMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchSecretMock.mockSecretPresent({});
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    deleteSecretMock.mock();
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentAuditTestUtil.empty();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    deleteSecretMock.restore();
    appClient.mockReset();
  });

  describe('(DELETE) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('Should return 403 and not delete environment for user without permission', async () => {
        // When
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.WRITE,
        );

        const response = await appClient
          .request(currentUser)
          // When
          .delete(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('Should return 200 and delete environment', async () => {
        // When
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );

        await appClient
          .request(currentUser)
          // When
          .delete(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          // Then
          .expect(200);

        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });

        const configurationEntity: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });
        expect(configurationEntity).toBeDefined();
        expect(configurationEntity?.environments.length).toEqual(0);

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
          EnvironmentAuditEventType.DELETED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            name: environment.name,
          },
        });
      });
    });

    describe('With Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('Should return 403 and not delete environment for user without permission', async () => {
        // When
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          30,
        );

        const response = await appClient
          .request(currentUser)
          // When
          .delete(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('Should return 200 and delete environment', async () => {
        // When
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );

        await appClient
          .request(currentUser)
          // When
          .delete(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          // Then
          .expect(200);

        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment.id,
        });

        const configurationEntity: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });
        expect(configurationEntity).toBeDefined();
        expect(configurationEntity?.environments.length).toEqual(0);

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
          EnvironmentAuditEventType.DELETED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            name: environment.name,
          },
        });
      });
    });
  });
});
