import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import { config } from '@symeo-sdk';
import User from 'src/domain/model/user/user.model';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchUserVcsRepositoryPermissionMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockUserRepositoryRole(
    user: User,
    repositoryId: number,
    role: VcsRepositoryRole,
  ): void {
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators/${user.username}/permission`,
      )
      .reply(200, {
        role_name: role,
      });
  }
}
