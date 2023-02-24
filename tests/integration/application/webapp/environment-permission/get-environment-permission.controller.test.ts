import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';

describe('EnvironmentPermissionController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
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
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId/permissions', () => {
    describe('should respond 200 and return permissions', () => {
      it('should respond 200 with only github environment accesses', async () => {
        // Given
        const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );

        const response = await appClient
          .request(currentUser)
          // When
          .get(
            `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
          )
          // Then
          .expect(200);
        expect(response.body.environmentPermissions).toBeDefined();
        expect(response.body.environmentPermissions.length).toEqual(3);
        const environmentPermissionsVerification =
          response.body.environmentPermissions.map(
            (environmentPermission: EnvironmentPermissionDTO) =>
              `${environmentPermission.user.userVcsId} - ${environmentPermission.environmentPermissionRole}`,
          );
        expect(environmentPermissionsVerification).toContain(
          '16590657 - admin',
        );
        expect(environmentPermissionsVerification).toContain(
          '22441392 - admin',
        );
        expect(environmentPermissionsVerification).toContain(
          '102222086 - readNonSecret',
        );
      });

      it('should respond 200 with mixed github and inBase environment accesses', async () => {
        // Given
        const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
        const configuration = await configurationTestUtil.createConfiguration(
          repository.id,
        );
        const environment = await environmentTestUtil.createEnvironment(
          configuration,
        );
        const environmentPermission1 =
          await environmentPermissionTestUtil.createEnvironmentPermission(
            environment,
            EnvironmentPermissionRole.READ_SECRET,
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
        expect(response.body.environmentPermissions).toBeDefined();
        expect(response.body.environmentPermissions.length).toEqual(3);

        const environmentPermission1InResponse =
          response.body.environmentPermissions.find(
            (el: any) => el.user.userVcsId === environmentPermission1.userVcsId,
          );
        const environmentPermission2InResponse =
          response.body.environmentPermissions.find(
            (el: any) => el.user.userVcsId === environmentPermission2.userVcsId,
          );
        const environmentPermission3InResponse =
          response.body.environmentPermissions.find(
            (el: any) => el.user.userVcsId === 102222086,
          );

        expect(
          environmentPermission1InResponse.environmentPermissionRole,
        ).toEqual('readSecret');
        expect(
          environmentPermission2InResponse.environmentPermissionRole,
        ).toEqual('write');
        expect(
          environmentPermission3InResponse.environmentPermissionRole,
        ).toEqual('readNonSecret');
      });
    });
  });
});
