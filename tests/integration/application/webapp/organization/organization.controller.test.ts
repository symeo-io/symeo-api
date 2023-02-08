import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
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
  });

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
        .get(`/organizations`)
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
