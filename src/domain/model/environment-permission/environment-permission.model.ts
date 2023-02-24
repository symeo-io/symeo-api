import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import Environment from 'src/domain/model/environment/environment.model';

export class EnvironmentPermission {
  id: string;
  userVcsId: number;
  userName?: string;
  userAvatarUrl?: string;
  environment: Environment;
  environmentPermissionRole: EnvironmentPermissionRole;

  constructor(
    id: string,
    userVcsId: number,
    environment: Environment,
    environmentPermissionRole: EnvironmentPermissionRole,
    userName?: string,
    userAvatarUrl?: string,
  ) {
    this.id = id;
    this.userVcsId = userVcsId;
    this.environment = environment;
    this.environmentPermissionRole = environmentPermissionRole;
    this.userName = userName;
    this.userAvatarUrl = userAvatarUrl;
  }
}
