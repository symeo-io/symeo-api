import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/environment-audit/environment-audit-event-type.enum';

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
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
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

  describe('(POST) /configurations/github/:repositoryVcsId/:configurationId/environments', () => {
    it('Should return 403 and not create new environment for user without permission', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.WRITE,
      );

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      const response = await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(403);
      expect(response.body.code).toEqual(
        SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
      );
      const environmentAuditEntity: EnvironmentAuditEntity[] =
        await environmentAuditTestUtil.repository.find();
      expect(environmentAuditEntity.length).toEqual(0);
    });

    it('Should return 201 and create new environment', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      fetchUserVcsRepositoryPermissionMock.mockUserRepositoryRole(
        currentUser,
        repository.owner.login,
        repository.name,
        VcsRepositoryRole.ADMIN,
      );

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(201);

      const configurationEntity: ConfigurationEntity | null =
        await configurationTestUtil.repository.findOneBy({
          id: configuration.id,
        });
      expect(configurationEntity).toBeDefined();
      expect(configurationEntity?.environments.length).toEqual(1);
      expect(configurationEntity?.environments[0].name).toEqual(data.name);

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
        EnvironmentAuditEventType.CREATED,
      );
      expect(environmentAuditEntity[0].metadata).toEqual({
        metadata: {
          name: data.name,
          color: data.color,
        },
      });
    });
  });
});
