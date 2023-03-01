import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export interface EnvironmentPermissionStoragePort {
  findForEnvironmentIdAndVcsUserIds(
    environmentId: string,
    vcsUserIds: number[],
  ): Promise<EnvironmentPermission[]>;

  findForEnvironmentIdAndVcsUserId(
    environmentId: string,
    userVcsId: number,
  ): Promise<EnvironmentPermission | undefined>;

  saveAll(environmentPermissions: EnvironmentPermission[]): Promise<void>;
}
