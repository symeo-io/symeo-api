import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { v4 as uuid } from 'uuid';

export class EnvironmentAccessUtils {
  generateDefaultEnvironmentAccessFromVcsUser(
    vcsUser: VcsUser,
  ): EnvironmentAccess {
    return new EnvironmentAccess(
      uuid(),
      vcsUser.id,
      this.mapGithubRightToSymeoRight(vcsUser.roleName),
    );
  }

  private mapGithubRightToSymeoRight(role_name: string) {
    switch (role_name) {
      case 'admin':
        return EnvironmentAccessRole.ADMIN;
      case 'maintain':
      case 'write':
      case 'triage':
      case 'read':
        return EnvironmentAccessRole.READ_NON_SECRET;
      default:
        return EnvironmentAccessRole.READ_NON_SECRET;
    }
  }
}
