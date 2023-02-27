import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const MinimumPermissionRoleRequired = (
  minimumPermissionRoleRequired: EnvironmentPermissionRole,
) => SetMetadata(ROLES_KEY, minimumPermissionRoleRequired);
