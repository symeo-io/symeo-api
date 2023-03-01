import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class FetchUserVcsRepositoryPermissionMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockUserRepositoryRole(role: VcsRepositoryRole): void {
    this.spy = jest.spyOn(
      this.githubClient.rest.repos,
      'getCollaboratorPermissionLevel',
    );

    this.spy.mockImplementationOnce(() =>
      Promise.resolve({
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          role_name: role,
        },
      }),
    );
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
