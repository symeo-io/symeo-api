import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
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
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
  });

  describe('(GET) /configurations/:repositoryVcsId/:configurationId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and return configuration', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
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
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment1,
          EnvironmentPermissionRole.ADMIN,
          currentUser.getVcsUserId(),
        );
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.READ,
        );

        const response = await appClient
          .request(currentUser)
          .get(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .expect(200);

        expect(response.body.configuration).toBeDefined();
        expect(response.body.configuration.id).toEqual(configuration.id);
        expect(response.body.configuration.name).toEqual(configuration.name);
        expect(response.body.configuration.environments.length).toEqual(2);
        expect(response.body.isCurrentUserRepositoryAdmin).toEqual(true);
        expect(response.body.currentUserEnvironmentsPermissions.length).toEqual(
          2,
        );

        const receivedEnvironment1Permission =
          response.body.currentUserEnvironmentsPermissions.find(
            (permission: any) => permission.environmentId === environment1.id,
          );

        const receivedEnvironment2Permission =
          response.body.currentUserEnvironmentsPermissions.find(
            (permission: any) => permission.environmentId === environment2.id,
          );

        expect(receivedEnvironment1Permission.userVcsId).toEqual(
          currentUser.getVcsUserId(),
        );
        expect(
          receivedEnvironment1Permission.environmentPermissionRole,
        ).toEqual(EnvironmentPermissionRole.ADMIN);
        expect(receivedEnvironment2Permission.userVcsId).toEqual(
          currentUser.getVcsUserId(),
        );
        expect(
          receivedEnvironment2Permission.environmentPermissionRole,
        ).toEqual(EnvironmentPermissionRole.READ_NON_SECRET);
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
      it('should respond 200 and return configuration', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
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
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment1,
          EnvironmentPermissionRole.ADMIN,
          currentUser.getVcsUserId(),
        );
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          10,
        );

        const response = await appClient
          .request(currentUser)
          .get(`/api/v1/configurations/${repository.id}/${configuration.id}`)
          .expect(200);

        expect(response.body.configuration).toBeDefined();
        expect(response.body.configuration.id).toEqual(configuration.id);
        expect(response.body.configuration.name).toEqual(configuration.name);
        expect(response.body.configuration.environments.length).toEqual(2);
        expect(response.body.isCurrentUserRepositoryAdmin).toEqual(true);
        expect(response.body.currentUserEnvironmentsPermissions.length).toEqual(
          2,
        );

        const receivedEnvironment1Permission =
          response.body.currentUserEnvironmentsPermissions.find(
            (permission: any) => permission.environmentId === environment1.id,
          );

        const receivedEnvironment2Permission =
          response.body.currentUserEnvironmentsPermissions.find(
            (permission: any) => permission.environmentId === environment2.id,
          );

        expect(receivedEnvironment1Permission.userVcsId).toEqual(
          currentUser.getVcsUserId(),
        );
        expect(
          receivedEnvironment1Permission.environmentPermissionRole,
        ).toEqual(EnvironmentPermissionRole.ADMIN);
        expect(receivedEnvironment2Permission.userVcsId).toEqual(
          currentUser.getVcsUserId(),
        );
        expect(
          receivedEnvironment2Permission.environmentPermissionRole,
        ).toEqual(EnvironmentPermissionRole.READ_NON_SECRET);
      });
    });
  });
});
