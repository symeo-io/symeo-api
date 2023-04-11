import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchGithubAccessTokenMock } from 'tests/utils/mocks/fetch-github-access-token.mock';
import { FetchVcsRepositoryBranchesMock } from 'tests/utils/mocks/fetch-vcs-repository-branches.mock';
import { FetchGitlabAccessTokenMock } from '../../../../utils/mocks/fetch-gitlab-access-token.mock';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let fetchGithubAccessTokenMock: FetchGithubAccessTokenMock;
  let fetchGitlabAccessTokenMock: FetchGitlabAccessTokenMock;
  let fetchVcsRepositoryBranchesMock: FetchVcsRepositoryBranchesMock;

  beforeAll(async () => {
    appClient = new AppClient();

    await appClient.init();

    fetchGithubAccessTokenMock = new FetchGithubAccessTokenMock(appClient);
    fetchGitlabAccessTokenMock = new FetchGitlabAccessTokenMock(appClient);
    fetchVcsRepositoryBranchesMock = new FetchVcsRepositoryBranchesMock(
      appClient,
    );
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    fetchGithubAccessTokenMock.mockAccessTokenPresent();
    fetchGitlabAccessTokenMock.mockAccessTokenPresent();
  });

  afterEach(() => {
    fetchGithubAccessTokenMock.restore();
    fetchGitlabAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /repository/:repositoryVcsId/branches', () => {
    describe('For Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );
      it('should respond 200 with github branches', async () => {
        // Given
        const mockRepositoryVcsId = faker.datatype.number();
        const branches =
          fetchVcsRepositoryBranchesMock.mockGithubRepositoriesBranchPresent(
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

    describe('For Gitlab as VcsProvider', () => {
      const currentUser = new User(
        `oauth2|gitlab|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.Gitlab,
        faker.datatype.number(),
      );
      it('should respond 200 with gitlab branches', async () => {
        // Given
        const mockRepositoryVcsId = faker.datatype.number();
        const branches =
          fetchVcsRepositoryBranchesMock.mockGitlabRepositoriesBranchPresent(
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
                commitSha: branches[0].commit.id,
                vcsType: 'gitlab',
              },
              {
                name: branches[1].name,
                commitSha: branches[1].commit.id,
                vcsType: 'gitlab',
              },
              {
                name: branches[2].name,
                commitSha: branches[2].commit.id,
                vcsType: 'gitlab',
              },
            ],
          });
      });
    });
  });
});
