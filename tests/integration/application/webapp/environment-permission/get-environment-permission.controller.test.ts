import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

describe('EnvironmentPermissionController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
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

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions', () => {
    describe('should respond 200 and return permissions', () => {
      it('should respond 200 with only github environment accesses', async () => {
        // Given
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

        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent(
          repository.id,
        );

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.permissions).toBeDefined();
        expect(response.body.permissions.length).toEqual(3);

        const environmentPermission1InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 16590657,
        );
        const environmentPermission2InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 22441392,
        );
        const environmentPermission3InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 102222086,
        );

        expect(
          environmentPermission1InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission2InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');
        expect(
          environmentPermission3InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');
      });

      it('should respond 200 with mixed github and inBase environment accesses', async () => {
        // Given
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

        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent(
          repository.id,
        );
        const environmentPermission1 =
          await environmentPermissionTestUtil.createEnvironmentPermission(
            environment,
            EnvironmentPermissionRole.ADMIN,
            16590657,
          );
        const environmentPermission2 =
          await environmentPermissionTestUtil.createEnvironmentPermission(
            environment,
            EnvironmentPermissionRole.WRITE,
            22441392,
          );

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.permissions).toBeDefined();
        expect(response.body.permissions.length).toEqual(3);

        const environmentPermission1InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === environmentPermission1.userVcsId,
        );
        const environmentPermission2InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === environmentPermission2.userVcsId,
        );
        const environmentPermission3InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 102222086,
        );

        expect(
          environmentPermission1InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission2InResponse.environmentPermissionRole,
        ).toEqual('write');
        expect(
          environmentPermission3InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');
      });

      it('should respond 200 with in-base environment accesses but updating github role to admin and delete environmentPermission linked to it', async () => {
        // Given
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
        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent(
          repository.id,
        );
        const environmentPermissionToBeRemoved =
          await environmentPermissionTestUtil.createEnvironmentPermission(
            environment,
            EnvironmentPermissionRole.READ_NON_SECRET,
            16590657,
          );

        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.ADMIN,
          22441392,
        );

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.permissions).toBeDefined();
        expect(response.body.permissions.length).toEqual(3);

        const environmentPermission1InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 16590657,
        );
        const environmentPermission2InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 22441392,
        );
        const environmentPermission3InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 102222086,
        );

        expect(
          environmentPermission1InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission2InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission3InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');

        const entityToBeRemoved =
          await environmentPermissionTestUtil.repository.findOneBy({
            id: environmentPermissionToBeRemoved.id,
          });
        expect(entityToBeRemoved).toBeNull();
        const entities = await environmentPermissionTestUtil.repository.find();
        expect(entities.length).toEqual(1);
        expect(entities[0].userVcsId).toEqual(22441392);
      });

      it('should respond 200 with in-base environment accesses but removing user from github organization', async () => {
        // Given
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
        fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent(
          repository.id,
        );

        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.ADMIN,
          16590657,
        );

        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.ADMIN,
          22441392,
        );

        const userVcsIdRemovedFromVcsRepository = faker.datatype.number({
          min: 111111,
          max: 999999,
        });
        const environmentPermissionEntityToBeRemoved =
          await environmentPermissionTestUtil.createEnvironmentPermission(
            environment,
            EnvironmentPermissionRole.WRITE,
            userVcsIdRemovedFromVcsRepository,
          );

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.permissions).toBeDefined();
        expect(response.body.permissions.length).toEqual(3);

        const environmentPermission1InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 16590657,
        );
        const environmentPermission2InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 22441392,
        );
        const environmentPermission3InResponse = response.body.permissions.find(
          (el: any) => el.user.vcsId === 102222086,
        );

        expect(
          environmentPermission1InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission2InResponse.environmentPermissionRole,
        ).toEqual('admin');
        expect(
          environmentPermission3InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');

        const entity = await environmentPermissionTestUtil.repository.findOneBy(
          {
            id: environmentPermissionEntityToBeRemoved.id,
          },
        );
        expect(entity).toBeNull();
      });
    });
  });
});
