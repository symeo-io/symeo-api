import EnvironmentAuditStoragePort from 'src/domain/port/out/environment-audit.storage.port';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentAuditEventType } from 'src/domain/model/environment-audit/environment-audit-event-type.enum';
import Environment from 'src/domain/model/environment/environment.model';
import EnvironmentAudit from 'src/domain/model/environment-audit/environment-audit.model';
import { EnvironmentMetadataType } from 'src/domain/model/environment-audit/environment-audit-metadata';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import ApiKey from 'src/domain/model/environment/api-key.model';

export default class EnvironmentAuditService {
  constructor(
    private environmentAuditStoragePort: EnvironmentAuditStoragePort,
  ) {}

  async saveWithEnvironmentMetadataType(
    environmentAuditEventType: EnvironmentAuditEventType,
    user: User,
    repository: VcsRepository,
    environment: Environment,
    environmentMetadata: EnvironmentMetadataType,
  ) {
    const environmentAudit = new EnvironmentAudit(
      environment.id,
      environmentAuditEventType,
      repository.id,
      user.id,
      user.username,
      {
        metadata: environmentMetadata,
      },
      new Date(),
    );
    await this.environmentAuditStoragePort.save(environmentAudit);
  }

  async saveAllWithPermissionMetadataType(
    environmentAuditEventType: EnvironmentAuditEventType,
    user: User,
    repository: VcsRepository,
    environment: Environment,
    previousEnvironmentPermissions: EnvironmentPermissionWithUser[],
    updatedEnvironmentPermissions: EnvironmentPermission[],
  ): Promise<void> {
    const environmentAudits: EnvironmentAudit[] = [];
    updatedEnvironmentPermissions.forEach((updatedEnvironmentPermission) => {
      const previousEnvironmentPermission = previousEnvironmentPermissions.find(
        (previousEnvironmentPermission) =>
          previousEnvironmentPermission.userVcsId ===
            updatedEnvironmentPermission.userVcsId &&
          previousEnvironmentPermission.environmentId ===
            updatedEnvironmentPermission.environmentId,
      );

      if (previousEnvironmentPermission) {
        environmentAudits.push(
          new EnvironmentAudit(
            environment.id,
            environmentAuditEventType,
            repository.id,
            user.id,
            user.username,
            {
              metadata: {
                userName: previousEnvironmentPermission.user.name,
                previousRole:
                  previousEnvironmentPermission.environmentPermissionRole,
                newRole: updatedEnvironmentPermission.environmentPermissionRole,
              },
            },
            new Date(),
          ),
        );
      }
    });
    await this.environmentAuditStoragePort.saveAll(environmentAudits);
  }

  async saveWithApiKeyMetadataType(
    environmentAuditEventType: EnvironmentAuditEventType,
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    apiKey: ApiKey,
  ) {
    const environmentAudit = new EnvironmentAudit(
      environment.id,
      environmentAuditEventType,
      repository.id,
      currentUser.id,
      currentUser.username,
      {
        metadata: {
          hiddenKey: apiKey.hiddenKey,
        },
      },
      new Date(),
    );
    await this.environmentAuditStoragePort.save(environmentAudit);
  }
}
