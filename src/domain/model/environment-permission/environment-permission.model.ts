import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export class EnvironmentPermission {
  id: string;
  userVcsId: number;
  environmentId: string;
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    userVcsId: number,
    environmentPermissionRole: EnvironmentPermissionRole,
    environmentId: string,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentId = environmentId;
    this.environmentPermissionRole = environmentPermissionRole;
  }
}
