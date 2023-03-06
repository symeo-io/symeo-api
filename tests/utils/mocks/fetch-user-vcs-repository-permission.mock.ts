import SpyInstance = jest.SpyInstance;
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';
import axios from 'axios';
import { config } from 'symeo-js/config';
import User from 'src/domain/model/user/user.model';

export class FetchUserVcsRepositoryPermissionMock {
  public spy: SpyInstance | undefined;

  public mockUserRepositoryRole(
    user: User,
    repositoryOwnerName: string,
    repositoryName: string,
    role: VcsRepositoryRole,
  ): void {
    this.spy = jest.spyOn(axios, 'get');
    this.spy.mockImplementationOnce((path: string) => {
      if (
        path ===
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators/${user.username}/permission`
      ) {
        return Promise.resolve({
          status: 200 as const,
          headers: {},
          url: '',
          data: {
            role_name: role,
          },
        });
      }
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
