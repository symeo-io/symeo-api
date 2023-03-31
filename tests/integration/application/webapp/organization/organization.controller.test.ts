import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { FetchVcsAccessTokenMock } from 'tests/utils/mocks/fetch-vcs-access-token.mock';
import { FetchVcsRepositoriesMock } from 'tests/utils/mocks/fetch-vcs-repositories.mock';
import { FetchAuthenticatedUserMock } from 'tests/utils/mocks/fetch-authenticated-user.mock';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let fetchVcsAccessTokenMock: FetchVcsAccessTokenMock;
  let fetchVcsRepositoriesMock: FetchVcsRepositoriesMock;
  let fetchAuthenticatedUserMock: FetchAuthenticatedUserMock;

  beforeAll(async () => {
    appClient = new AppClient();
    await appClient.init();
    fetchVcsAccessTokenMock = new FetchVcsAccessTokenMock(appClient);
    fetchVcsRepositoriesMock = new FetchVcsRepositoriesMock(appClient);
    fetchAuthenticatedUserMock = new FetchAuthenticatedUserMock(appClient);
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(() => {
    fetchVcsAccessTokenMock.mockAccessTokenPresent();
  });
  afterEach(() => {
    fetchVcsAccessTokenMock.restore();
    appClient.mockReset();
  });

  describe('(GET) /organizations', () => {
    describe('For Github as VcsProvider', () => {
      const currentUser = new User(
        `github|${faker.datatype.number()}`,
        faker.internet.email(),
        faker.internet.userName(),
        VCSProvider.GitHub,
        faker.datatype.number(),
      );

      it('should respond 200 with github repository', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGithubRepositoryPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 1,
                name: 'octocat',
                avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
              },
            ],
          });
      });

      it('should respond 200 with github organization when no repositories', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGithubRepositoryNotPresent();
        fetchAuthenticatedUserMock.mockGithubAuthenticatedPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 1,
                name: 'octocat',
                avatarUrl: 'https://github.com/images/error/octocat_happy.gif',
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

      it('should respond 200 with gitlab repository', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGitlabRepositoryPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 65616175,
                name: 'dfrances-test',
                avatarUrl:
                  '/uploads/-/system/group/avatar/65616175/gitlab8368.jpeg',
              },
            ],
          });
      });

      it('should respond 200 with gitlab organization when no repositories', async () => {
        // Given
        fetchVcsRepositoriesMock.mockGitlabRepositoryNotPresent();
        fetchAuthenticatedUserMock.mockGitlabAuthenticatedPresent();

        return appClient
          .request(currentUser)
          .get(`/api/v1/organizations`)
          .expect(200)
          .expect({
            organizations: [
              {
                vcsId: 12917479,
                name: 'DorianSymeo',
                avatarUrl:
                  'https://secure.gravatar.com/avatar/84a0b53a86a1f2bf0ddbbd85156631de?s=80&d=identicon',
              },
            ],
          });
      });
    });
  });
});
