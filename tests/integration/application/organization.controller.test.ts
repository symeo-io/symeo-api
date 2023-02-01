import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
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

  describe('(GET) /configurations/:id', () => {
    it('should respond 200 with github organization', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockGitHubOrganizationsResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [
          {
            login: 'symeo-io',
            id: 105865802,
            node_id: 'O_kgDOBk9iSg',
            url: 'https://api.github.com/orgs/symeo-io',
            repos_url: 'https://api.github.com/orgs/symeo-io/repos',
            events_url: 'https://api.github.com/orgs/symeo-io/events',
            hooks_url: 'https://api.github.com/orgs/symeo-io/hooks',
            issues_url: 'https://api.github.com/orgs/symeo-io/issues',
            members_url:
              'https://api.github.com/orgs/symeo-io/members{/member}',
            public_members_url:
              'https://api.github.com/orgs/symeo-io/public_members{/member}',
            avatar_url: 'https://avatars.githubusercontent.com/u/105865802?v=4',
            description: '',
          },
        ],
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient.rest.orgs, 'listForAuthenticatedUser')
        .mockImplementation(() =>
          Promise.resolve(mockGitHubOrganizationsResponse),
        );

      return appClient
        .request(currentUser)
        .get(`/organizations`)
        .expect(200)
        .expect({
          organizations: [
            {
              vcsId: 105865802,
              name: 'symeo-io',
              avatarUrl:
                'https://avatars.githubusercontent.com/u/105865802?v=4',
            },
          ],
        });
    });
  });
});
