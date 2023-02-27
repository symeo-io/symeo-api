import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentPermissionUser } from 'src/domain/model/environment-permission/environment-permission-user.model';

export class EnvironmentPermissionUtils {
  generateDefaultEnvironmentPermissionUserFromVcsUser(
    vcsUser: VcsUser,
    environment: Environment,
  ): EnvironmentPermissionUser {
    return new EnvironmentPermissionUser(
      {
        vcsId: vcsUser.id,
        name: vcsUser.name,
        avatarUrl: vcsUser.avatarUrl,
      },
      new EnvironmentPermission(
        uuid(),
        vcsUser.id,
        this.mapGithubRightToSymeoRight(vcsUser.roleName),
        environment.id,
      ),
    );
  }

  generateEnvironmentPermissionUser(
    vcsUser: VcsUser,
    inBaseEnvironmentPermission: EnvironmentPermission,
  ): EnvironmentPermissionUser {
    return new EnvironmentPermissionUser(
      {
        vcsId: vcsUser.id,
        name: vcsUser.name,
        avatarUrl: vcsUser.avatarUrl,
      },
      inBaseEnvironmentPermission,
    );
  }

  private mapGithubRightToSymeoRight(roleName: string) {
    switch (roleName) {
      case 'admin':
        return EnvironmentPermissionRole.ADMIN;
      case 'maintain':
      case 'write':
      case 'triage':
      case 'read':
        return EnvironmentPermissionRole.READ_NON_SECRET;
      default:
        return EnvironmentPermissionRole.READ_NON_SECRET;
    }
  }
}
