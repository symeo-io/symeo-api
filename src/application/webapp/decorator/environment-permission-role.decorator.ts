import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { SetMetadata } from '@nestjs/common';

export const ENVIRONMENT_PERMISSIONS_KEY = 'environmentPermissionRoles';
export const RequiredEnvironmentPermission = (
  minimumEnvironmentPermissionRequired: EnvironmentPermissionRole,
) =>
  SetMetadata(
    ENVIRONMENT_PERMISSIONS_KEY,
    minimumEnvironmentPermissionRequired,
  );
