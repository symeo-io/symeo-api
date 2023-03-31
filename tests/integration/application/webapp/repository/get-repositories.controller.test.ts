import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoriesMock } from 'tests/utils/mocks/fetch-vcs-repositories.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoriesMock: FetchVcsRepositoriesMock;
  let configurationTestUtil: ConfigurationTestUtil;

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
    fetchVcsRepositoriesMock = new FetchVcsRepositoriesMock(appClient);
    configurationTestUtil = new ConfigurationTestUtil(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationTestUtil.empty();
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(async () => {
    await appClient.mockReset();
    fetchVcsAccessTokenMock.restore();
  });

  describe('(GET) /repositories', () => {
    it('should respond 200 with github repositories', async () => {
      // Given
      const repositories = fetchVcsRepositoriesMock.mockRepositoryPresent();
      const configuration = await configurationTestUtil.createConfiguration(
        repositories[0].id,
      );

      return appClient
        .request(currentUser)
        .get(`/api/v1/repositories`)
        .expect(200)
        .expect({
          repositories: [
            {
              vcsId: repositories[0].id,
              name: 'Hello-World',
              owner: {
                name: repositories[0].owner.login,
                vcsId: repositories[0].owner.id,
                avatarUrl: repositories[0].owner.avatar_url,
              },
              pushedAt: '2011-01-26T19:06:43.000Z',
              vcsType: VCSProvider.GitHub,
              vcsUrl: 'https://github.com/octocat/Hello-World',
              isCurrentUserAdmin: false,
              defaultBranch: 'master',
              configurations: [
                {
                  id: configuration.id,
                  name: configuration.name,
                  vcsType: configuration.vcsType,
                  repository: {
                    vcsId: configuration.repositoryVcsId,
                    name: configuration.repositoryVcsName,
                  },
                  owner: {
                    vcsId: configuration.ownerVcsId,
                    name: configuration.ownerVcsName,
                  },
                  contractFilePath: configuration.contractFilePath,
                  branch: configuration.branch,
                  environments: [],
                },
              ],
            },
          ],
        });
    });
  });
});
