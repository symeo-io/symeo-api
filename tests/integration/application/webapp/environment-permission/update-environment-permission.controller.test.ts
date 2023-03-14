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
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';

describe('EnvironmentPermissionController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryCollaboratorsMockForPermission: FetchVcsRepositoryCollaboratorsMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentPermissionTestUtil: EnvironmentPermissionTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

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
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryCollaboratorsMockForPermission =
      new FetchVcsRepositoryCollaboratorsMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentPermissionTestUtil = new EnvironmentPermissionTestUtil(
      appClient,
    );
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  }, 30000);

  afterAll(() => {
    appClient.close();
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
    appClient.mockReset();
  });

  describe('(POST) github/:vcsRepository/:configurationId/environments/:environmentId/permissions', () => {
    it('should return 403 for user without permission', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.WRITE,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
      );

      const response = await appClient
        .request(currentUser)
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
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(0);
    });

    it('should return 400 for missing environment permissions data', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
      );

      await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send({ data: faker.name.firstName() })
        // Then
        .expect(400);
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(0);
    });

    it('should return 404 for trying to update permissions of user that do not have access to repository', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
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
      updateEnvironmentPermissionsDTO.permissions =
        updateEnvironmentPermissionDTOList;

      const response = await appClient
        .request(currentUser)
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
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(0);
    });

    it('should return 400 for trying to update permission of a github repository admin', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
      );

      const environmentPermissionToUpdateId = uuid();
      const environmentPermissionToUpdateVcsUserId = 16590657;
      const environmentPermissionToUpdateRole =
        EnvironmentPermissionRole.READ_SECRET;

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      updateEnvironmentPermissionsDTO.permissions = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];

      const response = await appClient
        .request(currentUser)
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
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(0);
    });

    it('should return 200 and create new environment permission for a github collaborator', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
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

      const environmentPermissionToUpdateId = uuid();
      const environmentPermissionToUpdateVcsUserId = 102222086;
      const environmentPermissionToUpdateRole =
        EnvironmentPermissionRole.READ_SECRET;

      const updateEnvironmentPermissionsDTO =
        new UpdateEnvironmentPermissionsDTO();
      updateEnvironmentPermissionsDTO.permissions = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];

      const response = await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(200);
      expect(response.body.permissions).toBeDefined();
      expect(response.body.permissions.length).toEqual(1);
      const environmentPermissionsVerification = response.body.permissions.map(
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

      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(1);
      expect(environmentAuditEntity[0].id).toBeDefined();
      expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
      );
      expect(environmentAuditEntity[0].eventType).toEqual(
        EnvironmentAuditEventType.PERMISSION_UPDATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          userName: 'Dorian-Frances',
          previousRole: EnvironmentPermissionRole.READ_NON_SECRET,
          newRole: EnvironmentPermissionRole.READ_SECRET,
        },
      });
    });

    it('should return 200 and update an in-base environment permission for a github collaborator', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );
      fetchVcsRepositoryCollaboratorsMockForPermission.mockCollaboratorsPresent(
        repository.owner.login,
        repository.name,
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
      updateEnvironmentPermissionsDTO.permissions = [
        new UpdateEnvironmentPermissionDTO(
          environmentPermissionToUpdateId,
          environmentPermissionToUpdateVcsUserId,
          environmentPermissionToUpdateRole,
        ),
      ];

      const response = await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/permissions`,
        )
        .send(updateEnvironmentPermissionsDTO)
        // Then
        .expect(200);
      expect(response.body.permissions).toBeDefined();
      expect(response.body.permissions.length).toEqual(1);
      const environmentPermissionsVerification = response.body.permissions.map(
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

      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(1);
      expect(environmentAuditEntity[0].id).toBeDefined();
      expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
      );
      expect(environmentAuditEntity[0].eventType).toEqual(
        EnvironmentAuditEventType.PERMISSION_UPDATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          userName: 'Dorian-Frances',
          previousRole: EnvironmentPermissionRole.WRITE,
          newRole: EnvironmentPermissionRole.READ_SECRET,
        },
      });
    });
  });
});
