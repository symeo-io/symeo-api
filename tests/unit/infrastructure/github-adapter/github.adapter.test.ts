import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import { instance, mock, when } from 'ts-mockito';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { config } from 'symeo/config';
import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import GithubAdapter from 'src/infrastructure/github-adapter/adapter/github.adapter';
import * as fs from 'fs';

describe('GithubAdapter', () => {
  describe('getOrganizations', () => {
    const mockedGithubHttpClient: GithubHttpClient = mock(GithubHttpClient);

    const user: User = new User(
      faker.datatype.uuid(),
      faker.internet.email(),
      VCSProvider.GitHub,
    );

    it('should get organizations', async () => {
      // Given
      const githubOrganizationsDTO = await JSON.parse(
        fs
          .readFileSync(
            './tests/unit/infrastructure/github-adapter/stubs/get_repositories_for_user_page_1.json',
          )
          .toString(),
      );

      // When
      when(
        await mockedGithubHttpClient.getRepositoriesForUser(
          user,
          1,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(githubOrganizationsDTO);

      when(
        await mockedGithubHttpClient.getRepositoriesForUser(
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
          'octocat',
          'https://github.com/images/error/octocat_happy.gif',
          VCSProvider.GitHub,
        ),
      ]);
    });

    it('should get organizations by removing duplications', async () => {
      // Given
      const githubOrganizationsDTO = await JSON.parse(
        fs
          .readFileSync(
            './tests/unit/infrastructure/github-adapter/stubs/get_repositories_for_user_page_1.json',
          )
          .toString(),
      );

      // When
      when(
        await mockedGithubHttpClient.getRepositoriesForUser(
          user,
          1,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(githubOrganizationsDTO);

      when(
        await mockedGithubHttpClient.getRepositoriesForUser(
          user,
          2,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(githubOrganizationsDTO);

      when(
        await mockedGithubHttpClient.getRepositoriesForUser(
          user,
          3,
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
          'octocat',
          'https://github.com/images/error/octocat_happy.gif',
          VCSProvider.GitHub,
        ),
      ]);
    });
  });
});
