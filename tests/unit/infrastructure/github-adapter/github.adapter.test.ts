import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import { instance, mock, when } from 'ts-mockito';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { config } from 'symeo/config';
import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import GithubAdapter from 'src/infrastructure/github-adapter/adapter/github.adapter';

describe('GithubAdapter', () => {
  describe('getOrganizations', () => {
    it('should get organizations', async () => {
      // Given
      const mockedGithubHttpClient: GithubHttpClient = mock(GithubHttpClient);

      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
      );
      const githubOrganizationsDTO = [
        {
          login: 'github',
          id: 1,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjE=',
          url: 'https://api.github.com/orgs/github',
          repos_url: 'https://api.github.com/orgs/github/repos',
          events_url: 'https://api.github.com/orgs/github/events',
          hooks_url: 'https://api.github.com/orgs/github/hooks',
          issues_url: 'https://api.github.com/orgs/github/issues',
          members_url: 'https://api.github.com/orgs/github/members{/member}',
          public_members_url:
            'https://api.github.com/orgs/github/public_members{/member}',
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          description: 'A great organization',
        },
      ];

      // When
      when(
        await mockedGithubHttpClient.getOrganizations(
          user,
          1,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(githubOrganizationsDTO);

      when(
        await mockedGithubHttpClient.getOrganizations(
          user,
          2,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn([]);

      const githubHttpClient: GithubHttpClient = instance(
        mockedGithubHttpClient,
      );

      const githubAdapter: GithubAdapter = new GithubAdapter(githubHttpClient);

      const organizations: VcsOrganization[] =
        await githubAdapter.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([
        new VcsOrganization(
          1,
          'github',
          'https://github.com/images/error/octocat_happy.gif',
          VCSProvider.GitHub,
        ),
      ]);
    });
  });
});
