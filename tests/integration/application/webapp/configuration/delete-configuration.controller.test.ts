import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { DeleteSecretMock } from 'tests/utils/mocks/delete-secret.mock';
import { FetchSecretMock } from 'tests/utils/mocks/fetch-secret.mock';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import { ConfigurationAuditTestUtil } from 'tests/utils/entities/configuration-audit.test.util';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let deleteSecretMock: DeleteSecretMock;
  let fetchSecretMock: FetchSecretMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let configurationAuditTestUtil: ConfigurationAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    deleteSecretMock = new DeleteSecretMock(appClient);
    fetchSecretMock = new FetchSecretMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    configurationAuditTestUtil = new ConfigurationAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await configurationAuditTestUtil.empty();
    fetchSecretMock.mockSecretPresent({});
    deleteSecretMock.mock();
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    deleteSecretMock.restore();
  });

  describe('(DELETE) /configurations/:repositoryVcsId/:configurationId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and delete configuration', async () => {
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
        const environment1 = await environmentTestUtil.createEnvironment(
          configuration,
        );
        const environment2 = await environmentTestUtil.createEnvironment(
          configuration,
        );

        await appClient
          .request(currentUser)
          .delete(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .expect(200);

        expect(deleteSecretMock.spy).toHaveBeenCalledTimes(2);
        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment1.id,
        });
        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment2.id,
        });

        const deletedConfiguration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });

        expect(deletedConfiguration).toBeNull();

        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(1);
        expect(configurationAuditEntity[0].id).toBeDefined();
        expect(configurationAuditEntity[0].userId).toEqual(currentUser.id);
        expect(configurationAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(configurationAuditEntity[0].configurationId).toEqual(
          configuration?.id,
        );
        expect(configurationAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(configurationAuditEntity[0].eventType).toEqual(
          ConfigurationAuditEventType.CREATED,
        );
        expect(configurationAuditEntity[0].metadata).toEqual({
          metadata: {
            name: configuration.name,
          },
        });
      });
    });

    describe('With Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 and delete configuration', async () => {
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
        const environment1 = await environmentTestUtil.createEnvironment(
          configuration,
        );
        const environment2 = await environmentTestUtil.createEnvironment(
          configuration,
        );

        await appClient
          .request(currentUser)
          .delete(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .expect(200);

        expect(deleteSecretMock.spy).toHaveBeenCalledTimes(2);
        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment1.id,
        });
        expect(deleteSecretMock.spy).toHaveBeenCalledWith({
          SecretId: environment2.id,
        });

        const deletedConfiguration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });

        expect(deletedConfiguration).toBeNull();

        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(1);
        expect(configurationAuditEntity[0].id).toBeDefined();
        expect(configurationAuditEntity[0].userId).toEqual(currentUser.id);
        expect(configurationAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(configurationAuditEntity[0].configurationId).toEqual(
          configuration?.id,
        );
        expect(configurationAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(configurationAuditEntity[0].eventType).toEqual(
          ConfigurationAuditEventType.CREATED,
        );
        expect(configurationAuditEntity[0].metadata).toEqual({
          metadata: {
            name: configuration.name,
          },
        });
      });
    });
  });
});
