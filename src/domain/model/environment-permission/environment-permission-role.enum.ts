export enum EnvironmentPermissionRole {
  ADMIN = 'admin',
  WRITE = 'write',
  READ_SECRET = 'readSecret',
  READ_NON_SECRET = 'readNonSecret',
}

export const ENVIRONMENT_PERMISSION_ROLE_ORDER = [
  EnvironmentPermissionRole.READ_NON_SECRET,
  EnvironmentPermissionRole.READ_SECRET,
  EnvironmentPermissionRole.WRITE,
  EnvironmentPermissionRole.ADMIN,
];
