import { AppClient } from 'tests/utils/app.client';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('AuditController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;
  let environmentAuditTestUtil: EnvironmentAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();

    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
    environmentAuditTestUtil = new EnvironmentAuditTestUtil(appClient);
  });

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    await environmentAuditTestUtil.empty();
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('getEnvironmentAudits', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should get environment audits', async () => {
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
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.CREATED,
          {
            metadata: {
              name: faker.name.firstName(),
              color: 'amber',
            },
          },
        );
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.UPDATED,
          {
            metadata: {
              name: faker.name.firstName(),
              color: 'blue',
            },
          },
        );
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.API_KEY_CREATED,
          {
            metadata: {
              hiddenKey: faker.datatype.string(),
            },
          },
        );

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repositoryVcsId}/${configuration.id}/${environment.id}/audits`,
          )
          .expect(200);
        expect(response.body.environmentAudits.length).toEqual(3);
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
      it('should get environment audits', async () => {
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
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.CREATED,
          {
            metadata: {
              name: faker.name.firstName(),
              color: 'amber',
            },
          },
        );
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.UPDATED,
          {
            metadata: {
              name: faker.name.firstName(),
              color: 'blue',
            },
          },
        );
        await environmentAuditTestUtil.createEnvironmentAudit(
          repository.id,
          configuration.id,
          environment.id,
          EnvironmentAuditEventType.API_KEY_CREATED,
          {
            metadata: {
              hiddenKey: faker.datatype.string(),
            },
          },
        );

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repositoryVcsId}/${configuration.id}/${environment.id}/audits`,
          )
          .expect(200);
        expect(response.body.environmentAudits.length).toEqual(3);
      });
    });
  });
});
