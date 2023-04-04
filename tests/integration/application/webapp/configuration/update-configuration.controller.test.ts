import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import { ConfigurationAuditTestUtil } from 'tests/utils/entities/configuration-audit.test.util';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let configurationAuditTestUtil: ConfigurationAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    configurationAuditTestUtil = new ConfigurationAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await configurationAuditTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(PATCH) /configurations/:repositoryVcsId/:configurationId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and update configuration', async () => {
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

        const newValues = {
          name: faker.lorem.slug(),
          contractFilePath: faker.lorem.slug(),
          branch: faker.lorem.slug(),
        };

        await appClient
          .request(currentUser)
          .patch(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .send(newValues)
          .expect(200);

        const updatedConfiguration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });

        expect(updatedConfiguration).toBeDefined();
        expect(updatedConfiguration?.name).toEqual(newValues.name);
        expect(updatedConfiguration?.contractFilePath).toEqual(
          newValues.contractFilePath,
        );
        expect(updatedConfiguration?.branch).toEqual(newValues.branch);

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
            name: newValues.name,
            branch: newValues.branch,
            contractFilePath: newValues.contractFilePath,
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
      it('should respond 200 and update configuration', async () => {
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

        const newValues = {
          name: faker.lorem.slug(),
          contractFilePath: faker.lorem.slug(),
          branch: faker.lorem.slug(),
        };

        await appClient
          .request(currentUser)
          .patch(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .send(newValues)
          .expect(200);

        const updatedConfiguration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });

        expect(updatedConfiguration).toBeDefined();
        expect(updatedConfiguration?.name).toEqual(newValues.name);
        expect(updatedConfiguration?.contractFilePath).toEqual(
          newValues.contractFilePath,
        );
        expect(updatedConfiguration?.branch).toEqual(newValues.branch);

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
            name: newValues.name,
            branch: newValues.branch,
            contractFilePath: newValues.contractFilePath,
          },
        });
      });
    });
  });
});
