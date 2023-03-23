import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';

describe('EnvironmentController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(PATCH) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId', () => {
    it('Should return 403 and not update environment for user without permission', async () => {
      // When
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
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}`,
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
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}`,
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
      expect(environmentAuditEntity[0].userName).toEqual(currentUser.username);
      expect(environmentAuditEntity[0].environmentId).toEqual(
        configurationEntity?.environments[0].id,
      );
      expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
        vcsRepositoryId,
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
