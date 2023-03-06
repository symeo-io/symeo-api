import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  const currentUser = new User(
    `github|${faker.datatype.number()}`,
    faker.internet.email(),
    faker.internet.userName(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock();
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock();
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
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId', () => {
    it('should respond 200 and return configuration', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
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
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.READ,
      );

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}`,
        )
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
      expect(receivedEnvironment1Permission.environmentPermissionRole).toEqual(
        EnvironmentPermissionRole.ADMIN,
      );
      expect(receivedEnvironment2Permission.userVcsId).toEqual(
        currentUser.getVcsUserId(),
      );
      expect(receivedEnvironment2Permission.environmentPermissionRole).toEqual(
        EnvironmentPermissionRole.READ_NON_SECRET,
      );
    });
  });
});
