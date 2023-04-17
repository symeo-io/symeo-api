import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';
import { EnvironmentTestUtil } from 'tests/utils/entities/environment.test.util';
import { FetchSecretVersionMock } from 'tests/utils/mocks/fetch-secret-version.mock';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('ValuesVersionController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchSecretVersionMock: FetchSecretVersionMock;
  let configurationTestUtil: ConfigurationTestUtil;
  let environmentTestUtil: EnvironmentTestUtil;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();

    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
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
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    fetchSecretVersionMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /github/:repositoryVcsId/:configurationId/environments/:environmentId/versions', () => {
    describe('With Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 and return environment versions sorted by creation date descending order', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/versions`,
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

    describe('With Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 and return environment versions sorted by creation date descending order', async () => {
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
            `/api/v1/configurations/${repository.id}/${configuration.id}/environments/${environment.id}/versions`,
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
});
