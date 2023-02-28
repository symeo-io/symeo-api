import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsRepositoriesMock } from 'tests/utils/mocks/fetch-vcs-repositories.mock';
import { ConfigurationTestUtil } from 'tests/utils/entities/configuration.test.util';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoriesMock: FetchVcsRepositoriesMock;
  let configurationTestUtil: ConfigurationTestUtil;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
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

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    fetchVcsRepositoryMock.restore();
    fetchVcsRepositoriesMock.restore();
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
              isCurrentUserVcsRepositoryAdmin: false,
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
