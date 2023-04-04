import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { config } from '@symeo-sdk';
import User from 'src/domain/model/user/user.model';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchUserVcsRepositoryPermissionMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubUserRepositoryRole(
    user: User,
    repositoryId: number,
    role: VcsRepositoryRole,
  ): void {
    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators/${user.username}/permission`,
      )
      .reply(200, {
        role_name: role,
      });
  }

  public mockGitlabUserRepositoryRole(
    user: User,
    repositoryId: number,
    accessLevelNumber: number,
  ): void {
    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/${user.getVcsUserId()}`,
      )
      .reply(200, {
        access_level: accessLevelNumber,
      });
  }
}
