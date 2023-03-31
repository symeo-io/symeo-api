export enum EnvironmentAuditEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  PERMISSION_UPDATED = 'permissionUpdated',
  API_KEY_CREATED = 'apiKeyCreated',
  API_KEY_DELETED = 'apiKeyDeleted',
  VALUES_UPDATED = 'valuesUpdated',
  SECRETS_READ = 'secretsRead',
  VERSION_ROLLBACK = 'versionRollback',
}
