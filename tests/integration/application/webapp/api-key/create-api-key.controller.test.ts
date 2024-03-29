import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { ApiKeyTestUtil } from 'tests/utils/entities/api-key.test.util';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { FetchUserVcsRepositoryPermissionMock } from 'tests/utils/mocks/fetch-user-vcs-repository-permission.mock';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('ApiKeyController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchUserVcsRepositoryPermissionMock: FetchUserVcsRepositoryPermissionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let apiKeyTestUtil: ApiKeyTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

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
    apiKeyTestUtil = new ApiKeyTestUtil(appClient);
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await apiKeyTestUtil.empty();
    await environmentAuditTestUtil.empty();
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    appClient.mockReset();
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
  });

  describe('(POST) /configurations/:repositoryVcsId/:configurationId/environments/:environmentId/api-keys', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 403 and not create api key for user without permission', async () => {
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
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.WRITE,
        );

        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
          )
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('should respond 201 and create api key', async () => {
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
        fetchUserVcsRepositoryPermissionMock.mockGithubUserRepositoryRole(
          currentUser,
          repository.id,
          VcsRepositoryRole.ADMIN,
        );

        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
          )
          .expect(201);

        expect(response.body.apiKey).toBeDefined();
        expect(response.body.apiKey.environmentId).toEqual(environment.id);
        expect(response.body.apiKey.key).toBeDefined();
        const apiKeyResponse = response.body.apiKey;

        const createdApiKey = await apiKeyTestUtil.repository.findOneBy({
          id: apiKeyResponse.id,
        });

        expect(createdApiKey).toBeDefined();
        expect(createdApiKey?.hiddenKey).toEqual(apiKeyResponse.hiddenKey);
        expect(createdApiKey?.hashedKey).toEqual(
          await ApiKey.hashKey(apiKeyResponse.key),
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.API_KEY_CREATED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            hiddenKey: createdApiKey?.hiddenKey,
          },
        });
      });
    });

    describe('With Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 403 and not create api key for user without permission', async () => {
        // Given
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

        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
          )
          .expect(403);
        expect(response.body.code).toEqual(
          SymeoExceptionCode.RESOURCE_ACCESS_DENIED,
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(0);
      });

      it('should respond 201 and create api key', async () => {
        // Given
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

        const response = await appClient
          .request(currentUser)
          .post(
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/api-keys`,
          )
          .expect(201);

        expect(response.body.apiKey).toBeDefined();
        expect(response.body.apiKey.environmentId).toEqual(environment.id);
        expect(response.body.apiKey.key).toBeDefined();
        const apiKeyResponse = response.body.apiKey;

        const createdApiKey = await apiKeyTestUtil.repository.findOneBy({
          id: apiKeyResponse.id,
        });

        expect(createdApiKey).toBeDefined();
        expect(createdApiKey?.hiddenKey).toEqual(apiKeyResponse.hiddenKey);
        expect(createdApiKey?.hashedKey).toEqual(
          await ApiKey.hashKey(apiKeyResponse.key),
        );
        const environmentAuditEntity: EnvironmentAuditEntity[] =
          await environmentAuditTestUtil.repository.find();
        expect(environmentAuditEntity.length).toEqual(1);
        expect(environmentAuditEntity[0].id).toBeDefined();
        expect(environmentAuditEntity[0].userId).toEqual(currentUser.id);
        expect(environmentAuditEntity[0].userName).toEqual(
          currentUser.username,
        );
        expect(environmentAuditEntity[0].environmentId).toEqual(environment.id);
        expect(environmentAuditEntity[0].repositoryVcsId).toEqual(
          repositoryVcsId,
        );
        expect(environmentAuditEntity[0].eventType).toEqual(
          EnvironmentAuditEventType.API_KEY_CREATED,
        );
        expect(environmentAuditEntity[0].metadata).toEqual({
          metadata: {
            hiddenKey: createdApiKey?.hiddenKey,
          },
        });
      });
    });
  });
});
