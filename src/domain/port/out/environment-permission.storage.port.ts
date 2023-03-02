import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export interface EnvironmentPermissionStoragePort {
  findForEnvironmentIdAndVcsUserId(
    environmentId: string,
    userVcsId: number,
  ): Promise<EnvironmentPermission | undefined>;

  findForEnvironmentIdsAndVcsUserId(
    environmentIds: string[],
    userVcsId: number,
  ): Promise<EnvironmentPermission[]>;

  saveAll(environmentPermissions: EnvironmentPermission[]): Promise<void>;

  removeForEnvironmentPermissions(
    persistedEnvironmentPermissionsToRemove: EnvironmentPermission[],
  ): Promise<void>;

  findForEnvironmentId(id: string): Promise<EnvironmentPermission[]>;
}
