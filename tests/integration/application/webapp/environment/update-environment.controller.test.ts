import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('EnvironmentController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentAuditTestUtil.empty();
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(PATCH) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('Should return 403 and not update environment for user without permission', async () => {
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

        const updatedEnvironmentData: UpdateEnvironmentDTO = {
          name: faker.name.firstName(),
          color: 'blueGrey',
        };
        const response = await appClient
          .request(currentUser)
          // When
          .patch(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          .send(updatedEnvironmentData)
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('Should return 200 and update environment for user with permission', async () => {
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

        const updatedEnvironmentData: UpdateEnvironmentDTO = {
          name: faker.name.firstName(),
          color: 'blueGrey',
        };
        await appClient
          .request(currentUser)
          // When
          .patch(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          .send(updatedEnvironmentData)
          // Then
          .expect(200);
        const configurationEntity: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });
        expect(configurationEntity).toBeDefined();
        expect(configurationEntity?.environments[0].id).toEqual(environment.id);
        expect(configurationEntity?.environments[0].name).toEqual(
          updatedEnvironmentData.name,
        );
        expect(configurationEntity?.environments[0].color).toEqual(
          updatedEnvironmentData.color.toString(),
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(
          configurationEntity?.environments[0].id,
        );
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.UPDATED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            name: updatedEnvironmentData.name,
            color: updatedEnvironmentData.color,
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
      it('Should return 403 and not update environment for user without permission', async () => {
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

        const updatedEnvironmentData: UpdateEnvironmentDTO = {
          name: faker.name.firstName(),
          color: 'blueGrey',
        };
        const response = await appClient
          .request(currentUser)
          // When
          .patch(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          .send(updatedEnvironmentData)
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('Should return 200 and update environment for user with permission', async () => {
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

        const updatedEnvironmentData: UpdateEnvironmentDTO = {
          name: faker.name.firstName(),
          color: 'blueGrey',
        };
        await appClient
          .request(currentUser)
          // When
          .patch(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}`,
          )
          .send(updatedEnvironmentData)
          // Then
          .expect(200);
        const configurationEntity: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: configuration.id,
          });
        expect(configurationEntity).toBeDefined();
        expect(configurationEntity?.environments[0].id).toEqual(environment.id);
        expect(configurationEntity?.environments[0].name).toEqual(
          updatedEnvironmentData.name,
        );
        expect(configurationEntity?.environments[0].color).toEqual(
          updatedEnvironmentData.color.toString(),
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(
          configurationEntity?.environments[0].id,
        );
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.UPDATED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            name: updatedEnvironmentData.name,
            color: updatedEnvironmentData.color,
          },
        });
      });
    });
  });
});
