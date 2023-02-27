import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export class EnvironmentPermissionUser {
  user: { vcsId: number; name: string; avatarUrl: string };
  permission: EnvironmentPermission;

  constructor(
    user: { vcsId: number; name: string; avatarUrl: string },
    permission: EnvironmentPermission,
  ) {
    this.user = user;
    this.permission = permission;
  }
}
