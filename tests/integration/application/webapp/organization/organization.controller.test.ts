import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;

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

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  describe('(GET) /organizations', () => {
    it('should respond 200 with github repository', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockGitHubRepositoriesForUserStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/get_repositories_for_user_page_1.json',
          )
          .toString(),
      );
      const mockGitHubRepositoriesForUserResponse1 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGitHubRepositoriesForUserStub1,
      };
      const mockGitHubRepositoriesForUserResponse2 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [],
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient.rest.repos, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesForUserResponse1),
        );
      jest
        .spyOn(githubClient.rest.repos, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesForUserResponse2),
        );

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
      const mockGitHubToken = uuid();
      const mockGitHubRepositoriesForUserResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [],
      };

      const mockGitHubAuthenticatedUserStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/organization/get_authenticated_user.json',
          )
          .toString(),
      );

      const mockGitHubAuthenticatedUserResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGitHubAuthenticatedUserStub1,
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient.rest.repos, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesForUserResponse),
        );
      jest
        .spyOn(githubClient.rest.users, 'getAuthenticated')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubAuthenticatedUserResponse),
        );

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
