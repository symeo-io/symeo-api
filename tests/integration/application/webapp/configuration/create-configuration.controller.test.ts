import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsFileMock } from 'tests/utils/mocks/fetch-vcs-file.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { ConfigurationAuditTestUtil } from 'tests/utils/entities/configuration-audit.test.util';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsFileMock: FetchVcsFileMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let configurationAuditTestUtil: ConfigurationAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchUserVcsRepositoryPermissionMock =
      new FetchUserVcsRepositoryPermissionMock(appClient);
    fetchVcsFileMock = new FetchVcsFileMock(appClient);
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

  afterEach(async () => {
    await appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(POST) /configurations/:repositoryVcsId', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 404 and not create configuration for non existing config file', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const dataToSend = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsFileMock.mockGithubFileMissing(
          repository.id,
          dataToSend.contractFilePath,
        );

        await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(dataToSend)
          // Then
          .expect(404);
        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(0);
      });

      it('should respond 403 and not create configuration for non admin user', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const dataToSend = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.WRITE,
        );
        fetchVcsFileMock.mockGithubFilePresent(
          repository.id,
          dataToSend.contractFilePath,
        );
        const response = await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(dataToSend)
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(0);
      });

      it('should respond 200 and create new configuration and adding "CREATE" audit log in configuration audit table', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const sendData = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );
        fetchVcsFileMock.mockGithubFilePresent(
          repository.id,
          sendData.contractFilePath,
        );
        const response = await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(sendData)
          // Then
          .expect(201);

        expect(response.body.configuration.id).toBeDefined();
        const configuration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: response.body.configuration.id,
          });

        expect(configuration).toBeDefined();
        expect(configuration?.name).toEqual(sendData.name);
        expect(configuration?.repositoryVcsId).toEqual(repository.id);
        expect(configuration?.repositoryVcsName).toEqual(repository.name);
        expect(configuration?.ownerVcsId).toEqual(repository.owner.id);
        expect(configuration?.ownerVcsName).toEqual(repository.owner.login);
        expect(configuration?.vcsType).toEqual(VCSProvider.GitHub);
        expect(configuration?.contractFilePath).toEqual(
          sendData.contractFilePath,
        );
        expect(configuration?.branch).toEqual(sendData.branch);
        expect(configuration?.environments).toBeDefined();
        expect(configuration?.environments.length).toEqual(2);

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
            name: configuration?.name,
            branch: configuration?.branch,
            contractFilePath: configuration?.contractFilePath,
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
      it('should respond 404 and not create configuration for non existing config file', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const dataToSend = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );
        fetchVcsFileMock.mockGitlabFileMissing(
          repository.id,
          dataToSend.contractFilePath,
        );

        await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(dataToSend)
          // Then
          .expect(404);
        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(0);
      });

      it('should respond 403 and not create configuration for non admin user', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const dataToSend = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          30,
        );
        fetchVcsFileMock.mockGitlabFilePresent(
          repository.id,
          dataToSend.contractFilePath,
        );
        const response = await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(dataToSend)
          // Then
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const configurationAuditEntity: ConfigurationAuditEntity[] =
          await configurationAuditTestUtil.repository.find();
        expect(configurationAuditEntity.length).toEqual(0);
      });

      it('should respond 200 and create new configuration and adding "CREATE" audit log in configuration audit table', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const sendData = {
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
        };
        fetchUserVcsRepositoryPermissionMock.mockGitlabUserRepositoryRole(
          currentUser,
          repository.id,
          50,
        );
        fetchVcsFileMock.mockGitlabFilePresent(
          repository.id,
          sendData.contractFilePath,
        );
        const response = await appClient
          .request(currentUser)
          // When
          .post(`/api/v1/configurations/${repository.id}`)
          .send(sendData)
          // Then
          .expect(201);

        expect(response.body.configuration.id).toBeDefined();
        const configuration: ConfigurationEntity | null =
          await configurationTestUtil.repository.findOneBy({
            id: response.body.configuration.id,
          });

        expect(configuration).toBeDefined();
        expect(configuration?.name).toEqual(sendData.name);
        expect(configuration?.repositoryVcsId).toEqual(repository.id);
        expect(configuration?.repositoryVcsName).toEqual(repository.name);
        expect(configuration?.ownerVcsId).toEqual(repository.namespace.id);
        expect(configuration?.ownerVcsName).toEqual(repository.namespace.name);
        expect(configuration?.vcsType).toEqual(VCSProvider.Gitlab);
        expect(configuration?.contractFilePath).toEqual(
          sendData.contractFilePath,
        );
        expect(configuration?.branch).toEqual(sendData.branch);
        expect(configuration?.environments).toBeDefined();
        expect(configuration?.environments.length).toEqual(2);

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
            name: configuration?.name,
            branch: configuration?.branch,
            contractFilePath: configuration?.contractFilePath,
          },
        });
      });
    });
  });
});
