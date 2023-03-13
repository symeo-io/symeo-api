import { AppClient } from 'tests/utils/app.client';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { ConfigurationAuditTestUtil } from 'tests/utils/entities/configuration-audit.test.util';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import { ConfigurationAuditDTO } from 'src/application/webapp/dto/audit/configuration-audit.dto';
import { GetConfigurationAuditsResponseDTO } from 'src/application/webapp/dto/audit/get-configuration-audits.response.dto';

describe('AuditController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let configurationAuditTestUtil: ConfigurationAuditTestUtil;

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

    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('getConfigurationAudits', () => {
    it('should get configuration audits', async () => {
      // Given
      const vcsRepositoryId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(vcsRepositoryId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      await configurationAuditTestUtil.createConfigurationAudit(
        faker.datatype.number(),
        repository.id,
        configuration.id,
        ConfigurationAuditEventType.CREATED,
      );
      await configurationAuditTestUtil.createConfigurationAudit(
        faker.datatype.number(),
        repository.id,
        configuration.id,
        ConfigurationAuditEventType.UPDATED,
      );

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/${vcsRepositoryId}/${configuration.id}/audits`,
        )
        .expect(200);
      expect(response.body.configurationAudits.length).toEqual(2);
    });
  });
});
