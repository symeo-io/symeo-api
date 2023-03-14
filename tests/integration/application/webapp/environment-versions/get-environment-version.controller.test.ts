import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretVersionMock } from 'tests/utils/mocks/fetch-secret-version.mock';
import { EnvironmentVersionDTO } from 'src/application/webapp/dto/environment-version/environment-version.dto';

describe('EnvironmentVersionController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretVersionMock: FetchSecretVersionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

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
    fetchSecretVersionMock = new FetchSecretVersionMock(appClient);

    configurationTestUtil = new ConfigurationTestUtil(appClient);
    environmentTestUtil = new EnvironmentTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    await environmentTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchSecretVersionMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /github/:repositoryVcsId/:configurationId/environments/:environmentId/versions', () => {
    it('should respond 200 and return environment versions', async () => {
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

      const secretVersions = [
        {
          CreatedDate: faker.datatype.datetime({}).toLocaleDateString(),
          VersionId: faker.datatype.string(),
          VersionStages: [],
        },
        {
          CreatedDate: faker.datatype.datetime({}).toLocaleDateString(),
          VersionId: faker.datatype.string(),
          VersionStages: [faker.datatype.uuid()],
        },
        {
          CreatedDate: faker.datatype.datetime({}).toLocaleDateString(),
          VersionId: faker.datatype.string(),
          VersionStages: [faker.datatype.uuid()],
        },
      ];

      fetchSecretVersionMock.mockSecretVersionPresent(secretVersions);

      // When
      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repository.id}/${configuration.id}/environments/${environment.id}/versions`,
        )
        // Then
        .expect(200);
      expect(response.body.versions.length).toEqual(3);
      expect(
        response.body.versions.map(
          (version: EnvironmentVersionDTO) => version.versionId,
        ),
      ).toContain(secretVersions[0].VersionId);
      expect(
        response.body.versions.map(
          (version: EnvironmentVersionDTO) => version.versionId,
        ),
      ).toContain(secretVersions[1].VersionId);
      expect(
        response.body.versions.map(
          (version: EnvironmentVersionDTO) => version.versionId,
        ),
      ).toContain(secretVersions[2].VersionId);
    });
  });
});
