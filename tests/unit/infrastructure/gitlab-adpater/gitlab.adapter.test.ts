import { GithubHttpClient } from 'src/infrastructure/github-adapter/github.http.client';
import { instance, mock, when } from 'ts-mockito';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { config } from 'symeo-js';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import GithubAdapter from 'src/infrastructure/github-adapter/adapter/github.adapter';
import * as fs from 'fs';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import GitlabAdapter from 'src/infrastructure/gitlab-adapter/adapter/gitlab.adapter';

describe('GitlabAdapter', () => {
  describe('getOrganizations', () => {
    const mockedGitlabHttpClient: GitlabHttpClient = mock(GitlabHttpClient);

    const user = new User(
      `gitlab|${faker.datatype.number()}`,
      faker.internet.email(),
      faker.internet.userName(),
      VCSProvider.Gitlab,
      faker.datatype.number(),
    );

    it('should get organizations', async () => {
      // Given
      const gitlabOrganizationsDTO = await JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/gitlab/get_repositories_for_user_page_1.json',
          )
          .toString(),
      );

      // When
      when(
        await mockedGitlabHttpClient.getRepositoriesForUser(
          user,
          1,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(gitlabOrganizationsDTO);

      when(
        await mockedGitlabHttpClient.getRepositoriesForUser(
          user,
          2,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn([]);

      const gitlabHttpClient: GitlabHttpClient = instance(
        mockedGitlabHttpClient,
      );

      const gitlabAdapter: GitlabAdapter = new GitlabAdapter(gitlabHttpClient);

      const organizations: VcsOrganization[] =
        await gitlabAdapter.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([
        new VcsOrganization(
          65616175,
          'dfrances-test',
          '/uploads/-/system/group/avatar/65616175/gitlab8368.jpeg',
          VCSProvider.Gitlab,
        ),
      ]);
    });

    it('should get organizations by removing duplications', async () => {
      // Given
      const gitlabOrganizationsDTO = await JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/gitlab/get_repositories_for_user_page_1.json',
          )
          .toString(),
      );

      // When
      when(
        await mockedGitlabHttpClient.getRepositoriesForUser(
          user,
          1,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(gitlabOrganizationsDTO);

      when(
        await mockedGitlabHttpClient.getRepositoriesForUser(
          user,
          2,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn(gitlabOrganizationsDTO);

      when(
        await mockedGitlabHttpClient.getRepositoriesForUser(
          user,
          3,
          config.vcsProvider.paginationLength,
        ),
      ).thenReturn([]);

      const gitlabHttpClient: GitlabHttpClient = instance(
        mockedGitlabHttpClient,
      );

      const gitlabAdapter: GitlabAdapter = new GitlabAdapter(gitlabHttpClient);

      const organizations: VcsOrganization[] =
        await gitlabAdapter.getOrganizations(user);

      // Then
      expect(organizations.length).toEqual(1);
      expect(organizations).toEqual([
        new VcsOrganization(
          65616175,
          'dfrances-test',
          '/uploads/-/system/group/avatar/65616175/gitlab8368.jpeg',
          VCSProvider.Gitlab,
        ),
      ]);
    });
  });
});
