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
import { EnvironmentAuditTestUtil } from 'tests/utils/entities/environment-audit.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import { EnvironmentColors } from 'src/domain/model/environment/environment-color.model';

describe('AuditController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
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

    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
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
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('getEnvironmentAudits', () => {
    it('should get environment audits', async () => {
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
          `/api/v1/configurations/${vcsRepositoryId}/${configuration.id}/${environment.id}/audits`,
        )
        .expect(200);
      expect(response.body.environmentAudits.length).toEqual(3);
    });
  });
});
