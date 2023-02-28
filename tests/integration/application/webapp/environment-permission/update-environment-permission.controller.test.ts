import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { UpdateEnvironmentPermissionsDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permissions.dto';
import { UpdateEnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/update-environment-permission.dto';
import { SymeoExceptionCodeToHttpStatusMap } from 'src/application/common/exception/symeo.exception.code.to.http.status.map';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { EnvironmentPermissionDTO } from 'src/application/webapp/dto/environment-permission/environment-permission.dto';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsRepositoryCollaboratorsMock } from 'tests/utils/mocks/fetch-vcs-repository-collaborators.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { EnvironmentPermissionTestUtil } from 'tests/utils/entities/environment-permission.test.util';

describe('EnvironmentPermissionController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMockForPermission: FetchVcsRepositoryCollaboratorsMock;
  let fetchVcsRepositoryCollaboratorsMock: FetchVcsRepositoryCollaboratorsMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryCollaboratorsMockForPermission =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    fetchVcsRepositoryCollaboratorsMock =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentPermissionTestUtil = new EnvironmentPermissionTestUtil(
      appClient,
    );
  }, 30000);

  afterAll(() => {
    appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentPermissionTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
    fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent();
    fetchVcsRepositoryCollaboratorsMock.mockCollaboratorsPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsRepositoryCollaboratorsMockForPermission.restore();
    fetchVcsRepositoryCollaboratorsMock.restore();
  });

  describe('(POST) github/:vcsRepository/:configurationId/environments/:environmentId/permissions', () => {
    it('should return 403 for user without permission', async () => {
      // Given
      const currentUserWithoutPermission = new User(
        'github|102222086',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const response = await appClient
        .request(currentUserWithoutPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send({ data: faker.name.firstName() })
        // Then
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
    });

    it('should return 400 for missing environment permissions data', async () => {
      // Given
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send({ data: faker.name.firstName() })
        // Then
        .expect(400);
    });

    it('should return 404 for trying to update permissions of user that do not have access to repository', async () => {
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      const updateEnvironmentPermissionDTOList = [
        new UpdateEnvironmentPermissionDTO(
          faker.datatype.uuid(),
          faker.datatype.number({ min: 1, max: 100000 }),
          EnvironmentPermissionRole.READ_SECRET,
        ),
      ];
      updateEnvironmentPermissionsDTO.environmentPermissions =
        updateEnvironmentPermissionDTOList;

      const response = await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(404);
      expect(response.body.statusCode).toBe(
        SymeoExceptionCodeToHttpStatusMap[
          SymeoExceptionCode.REPOSITORY_NOT_FOUND
        ],
      );
      expect(response.body.message).toBe(
        `User with vcsIds ${updateEnvironmentPermissionDTOList[0].userVcsId} do not have access to repository with vcsRepositoryId ${repository.id}`,
      );
    });

    it('should return 400 for trying to update permission of a github repository admin', async () => {
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      const repository = fetchVcsRepositoryMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const environmentPermissionToUpdateId = uuid();
      const environmentPermissionToUpdateVcsUserId = 16590657;
      const environmentPermissionToUpdateRole =
        EnvironmentPermissionRole.READ_SECRET;

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      const updateEnvironmentPermissionDTOList = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];
      updateEnvironmentPermissionsDTO.environmentPermissions =
        updateEnvironmentPermissionDTOList;

      const response = await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(400);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.UPDATE_ADMINISTRATOR_PERMISSION,
      );
      expect(response.body.message).toBe(
        `User with vcsId ${environmentPermissionToUpdateVcsUserId} is administrator of the repository, thus you can not modify his environment permissions`,
      );
    });

    it('should return 200 and create new environment permission for a github collaborator', async () => {
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
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
          EnvironmentPermissionRole.ADMIN,
          16590657,
        );

      const environmentPermission2 =
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.ADMIN,
          22441392,
        );

      const environmentPermissionToUpdateId = uuid();
      const environmentPermissionToUpdateVcsUserId = 102222086;
      const environmentPermissionToUpdateRole =
        EnvironmentPermissionRole.READ_SECRET;

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      const updateEnvironmentPermissionDTOList = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];
      updateEnvironmentPermissionsDTO.environmentPermissions =
        updateEnvironmentPermissionDTOList;

      const response = await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(200);
      expect(response.body.environmentPermissions).toBeDefined();
      expect(response.body.environmentPermissions.length).toEqual(1);
      const environmentPermissionsVerification =
        response.body.environmentPermissions.map(
          (environmentPermissionDTO: EnvironmentPermissionDTO) =>
            `${environmentPermissionDTO.userVcsId} - ${environmentPermissionDTO.environmentPermissionRole}`,
        );
      expect(environmentPermissionsVerification).toContain(
        `${environmentPermissionToUpdateVcsUserId} - ${environmentPermissionToUpdateRole}`,
      );

      const updatedEnvironmentPermissionEntity =
        await environmentPermissionTestUtil.repository.findOneBy({
          id: environmentPermissionToUpdateId,
        });
      expect(
        updatedEnvironmentPermissionEntity?.environmentPermissionRole,
      ).toBe(EnvironmentPermissionRole.READ_SECRET);
    });

    it('should return 200 and update an in-base environment permission for a github collaborator', async () => {
      const currentUserWithPermission = new User(
        'github|16590657',
        faker.internet.email(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

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
          EnvironmentPermissionRole.ADMIN,
          16590657,
        );

      const environmentPermission2 =
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.ADMIN,
          22441392,
        );

      const environmentPermission3 =
        await environmentPermissionTestUtil.createEnvironmentPermission(
          environment,
          EnvironmentPermissionRole.WRITE,
          102222086,
        );

      const environmentPermissionToUpdateId = environmentPermission3.id;
      const environmentPermissionToUpdateVcsUserId =
        environmentPermission3.userVcsId;
      const environmentPermissionToUpdateRole =
        EnvironmentPermissionRole.READ_SECRET;

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      const updateEnvironmentPermissionDTOList = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];
      updateEnvironmentPermissionsDTO.environmentPermissions =
        updateEnvironmentPermissionDTOList;

      const response = await appClient
        .request(currentUserWithPermission)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(200);
      expect(response.body.environmentPermissions).toBeDefined();
      expect(response.body.environmentPermissions.length).toEqual(1);
      const environmentPermissionsVerification =
        response.body.environmentPermissions.map(
          (environmentPermissionDTO: EnvironmentPermissionDTO) =>
            `${environmentPermissionDTO.userVcsId} - ${environmentPermissionDTO.environmentPermissionRole}`,
        );
      expect(environmentPermissionsVerification).toContain(
        `${environmentPermissionToUpdateVcsUserId} - ${environmentPermissionToUpdateRole}`,
      );

      const updatedEnvironmentPermissionEntity =
        await environmentPermissionTestUtil.repository.findOneBy({
          id: environmentPermissionToUpdateId,
        });
      expect(
        updatedEnvironmentPermissionEntity?.environmentPermissionRole,
      ).toBe(EnvironmentPermissionRole.READ_SECRET);
    });
  });
});
