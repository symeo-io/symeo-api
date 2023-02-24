import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

export class UpdateEnvironmentPermissionDTO {
  id: string;
  userVcsId: number;
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    userVcsId: number,
    environmentPermissionRole: EnvironmentPermissionRole,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environmentPermissionRole = environmentPermissionRole;
  }
}
