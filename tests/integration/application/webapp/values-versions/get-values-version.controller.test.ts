import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretVersionMock } from 'tests/utils/mocks/fetch-secret-version.mock';
import { ValuesVersionDto } from 'src/application/webapp/dto/values-version/values-version.dto';

describe('ValuesVersionController', () => {
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
    it('should respond 200 and return environment versions sorted by creation date descending order', async () => {
      // Given
      const repositoryVcsId = faker.datatype.number();
      const repository =
        fetchVcsRepositoryMock.mockRepositoryPresent(repositoryVcsId);
      const configuration = await configurationTestUtil.createConfiguration(
        repository.id,
      );
      const environment = await environmentTestUtil.createEnvironment(
        configuration,
      );

      const secretVersions = [
        {
          CreatedDate: new Date(1980, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [],
        },
        {
          CreatedDate: new Date(1990, 1, 1),
          VersionId: faker.datatype.uuid(),
          VersionStages: [faker.datatype.uuid()],
        },
        {
          CreatedDate: new Date(1970, 1, 1),
          VersionId: faker.datatype.uuid(),
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
      expect(response.body.versions[0].versionId).toEqual(
        secretVersions[1].VersionId,
      );
      expect(response.body.versions[1].versionId).toEqual(
        secretVersions[0].VersionId,
      );
      expect(response.body.versions[2].versionId).toEqual(
        secretVersions[2].VersionId,
      );
    });
  });
});
