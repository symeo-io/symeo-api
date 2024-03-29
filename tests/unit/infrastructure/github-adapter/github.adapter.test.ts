import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import { instance, mock, when } from 'ts-mockito';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { config } from '@symeo-sdk';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import GithubAdapter from 'src/infrastructure/github-adapter/adapter/github.adapter';
import * as fs from 'fs';
import { PlanEnum } from '../../../../src/domain/model/licence/plan.enum';
import Licence from '../../../../src/domain/model/licence/licence.model';

describe('GithubAdapter', () => {
  describe('getOrganizations', () => {
    const mockedGithubHttpClient: GithubHttpClient = mock(GithubHttpClient);

    const user = new User(
      `github|${faker.datatype.number()}`,
      faker.internet.email(),
      faker.internet.userName(),
      VCSProvider.GitHub,
      faker.datatype.number(),
    );

    it('should get organizations', async () => {
      // Given
      const githubOrganizationsDTO = await JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/github/get_repositories_for_user_page_1.json',
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
            './tests/utils/stubs/repository/github/get_repositories_for_user_page_1.json',
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
          'octocat',
          'https://github.com/images/error/octocat_happy.gif',
          VCSProvider.GitHub,
        ),
      ]);
    });
  });
});
