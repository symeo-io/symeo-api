import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { VcsRepositoryRole } from 'src/domain/model/vcs/vcs.repository.role.enum';

export class EnvironmentPermissionUtils {
  generateDefaultEnvironmentPermissionUserFromVcsUser(
    vcsUser: VcsUser,
    environment: Environment,
  ): EnvironmentPermissionWithUser {
    return new EnvironmentPermissionWithUser(
      vcsUser,
      new EnvironmentPermission(
        uuid(),
        vcsUser.id,
        this.mapGithubRoleToDefaultEnvironmentPermission(vcsUser.role),
        environment.id,
      ),
    );
  }

  generateEnvironmentPermissionUser(
    vcsUser: VcsUser,
    inBaseEnvironmentPermission: EnvironmentPermission,
  ): EnvironmentPermissionWithUser {
    return new EnvironmentPermissionWithUser(
      vcsUser,
      inBaseEnvironmentPermission,
    );
  }

  mapGithubRoleToDefaultEnvironmentPermission(
    vcsRepositoryRoleEnum: VcsRepositoryRole,
  ) {
    switch (vcsRepositoryRoleEnum) {
      case VcsRepositoryRole.ADMIN:
        return EnvironmentPermissionRole.ADMIN;
      case VcsRepositoryRole.MAINTAIN:
      case VcsRepositoryRole.WRITE:
      case VcsRepositoryRole.TRIAGE:
      case VcsRepositoryRole.READ:
        return EnvironmentPermissionRole.READ_NON_SECRET;
      default:
        return EnvironmentPermissionRole.READ_NON_SECRET;
    }
  }
}
