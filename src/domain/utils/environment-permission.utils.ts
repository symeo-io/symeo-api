import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/environment/environment.model';

export class EnvironmentPermissionUtils {
  generateDefaultEnvironmentPermissionFromVcsUser(
    vcsUser: VcsUser,
    environment: Environment,
  ): EnvironmentPermission {
    return new EnvironmentPermission(
      uuid(),
      vcsUser.id,
      environment,
      this.mapGithubRightToSymeoRight(vcsUser.roleName),
      vcsUser.name,
      vcsUser.avatarUrl,
    );
  }

  generateEnvironmentPermission(
    vcsUser: VcsUser,
    inBaseEnvironmentPermission: EnvironmentPermission,
  ): EnvironmentPermission {
    return new EnvironmentPermission(
      inBaseEnvironmentPermission.id,
      inBaseEnvironmentPermission.userVcsId,
      inBaseEnvironmentPermission.environment,
      inBaseEnvironmentPermission.environmentPermissionRole,
      vcsUser.name,
      vcsUser.avatarUrl,
    );
  }

  private mapGithubRightToSymeoRight(role_name: string) {
    switch (role_name) {
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
