import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { VcsUser } from 'src/domain/model/vcs/vcs.user.model';

export class EnvironmentPermissionWithUser extends EnvironmentPermission {
  user: VcsUser;

  constructor(user: VcsUser, permission: EnvironmentPermission) {
    super(
      permission.id,
      permission.userVcsId,
      permission.environmentPermissionRole,
      permission.environmentId,
    );
    this.user = user;
  }
}
