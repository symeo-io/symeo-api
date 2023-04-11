import { AppClient } from 'tests/utils/app.client';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { ConfigurationAuditTestUtil } from 'tests/utils/entities/configuration-audit.test.util';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('AuditController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let configurationAuditTestUtil: ConfigurationAuditTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();

    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
    configurationAuditTestUtil = new ConfigurationAuditTestUtil(appClient);
  });

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await configurationAuditTestUtil.empty();
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('getConfigurationAudits', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should get configuration audits', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGithubRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.GitHub,
          repository.id,
        );
        await configurationAuditTestUtil.createConfigurationAudit(
          repository.id,
          configuration.id,
          ConfigurationAuditEventType.CREATED,
        );
        await configurationAuditTestUtil.createConfigurationAudit(
          repository.id,
          configuration.id,
          ConfigurationAuditEventType.UPDATED,
        );

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repositoryVcsId}/${configuration.id}/audits`,
          )
          .expect(200);
        expect(response.body.configurationAudits.length).toEqual(2);
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
      it('should get configuration audits', async () => {
        // Given
        const repositoryVcsId = faker.datatype.number();
        const repository =
          fetchVcsRepositoryMock.mockGitlabRepositoryPresent(repositoryVcsId);
        const configuration = await configurationTestUtil.createConfiguration(
          VCSProvider.Gitlab,
          repository.id,
        );
        await configurationAuditTestUtil.createConfigurationAudit(
          repository.id,
          configuration.id,
          ConfigurationAuditEventType.CREATED,
        );
        await configurationAuditTestUtil.createConfigurationAudit(
          repository.id,
          configuration.id,
          ConfigurationAuditEventType.UPDATED,
        );

        const response = await appClient
          .request(currentUser)
          .get(
            `/api/v1/configurations/${repositoryVcsId}/${configuration.id}/audits`,
          )
          .expect(200);
        expect(response.body.configurationAudits.length).toEqual(2);
      });
    });
  });
});
