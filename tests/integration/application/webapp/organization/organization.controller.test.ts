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
    it('should respond 200 with github repository', async () => {
      // Given
      fetchVcsRepositoriesMock.mockRepositoryPresent();

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
      fetchVcsRepositoriesMock.mockRepositoryNotPresent();
      fetchAuthenticatedUserMock.mockAuthenticatedPresent();

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
});
