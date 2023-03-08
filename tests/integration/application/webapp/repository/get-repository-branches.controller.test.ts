import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoryMock } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import { FetchVcsRepositoryBranchesMock } from 'tests/utils/mocks/fetch-vcs-repository-branches.mock';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoryMock: FetchVcsRepositoryMock;
  let fetchVcsRepositoryBranchesMock: FetchVcsRepositoryBranchesMock;

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

    fetchVcsRepositoryMock = new FetchVcsRepositoryMock(appClient);
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoryBranchesMock = new FetchVcsRepositoryBranchesMock(
      appClient,
    );
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /repository/:repositoryVcsId/branches', () => {
    it('should respond 200 with github branches', async () => {
      // Given
      const mockRepositoryVcsId = faker.datatype.number();
      const branches =
        fetchVcsRepositoryBranchesMock.mockRepositoriesBranchPresent(
          mockRepositoryVcsId,
        );

      return appClient
        .request(currentUser)
        .get(`/api/v1/repositories/${mockRepositoryVcsId}/branches`)
        .expect(200)
        .expect({
          branches: [
            {
              name: branches[0].name,
              commitSha: branches[0].commit.sha,
              vcsType: 'github',
            },
            {
              name: branches[1].name,
              commitSha: branches[1].commit.sha,
              vcsType: 'github',
            },
            {
              name: branches[2].name,
              commitSha: branches[2].commit.sha,
              vcsType: 'github',
            },
            {
              name: branches[3].name,
              commitSha: branches[3].commit.sha,
              vcsType: 'github',
            },
            {
              name: branches[4].name,
              commitSha: branches[4].commit.sha,
              vcsType: 'github',
            },
          ],
        });
    });
  });
});
