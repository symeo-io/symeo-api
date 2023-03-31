import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import {
  EnvironmentMetadataType,
  RollbackMetadataType,
  ValuesMetadataType,
} from 'src/domain/model/audit/environment-audit/environment-audit-metadata';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { EnvironmentPermissionWithUser } from 'src/domain/model/environment-permission/environment-permission-user.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export default interface EnvironmentAuditFacade {
  findEnvironmentAudits(environment: Environment): Promise<EnvironmentAudit[]>;

  saveWithEnvironmentMetadataType(
    eventType: EnvironmentAuditEventType,
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    metadata: EnvironmentMetadataType,
  ): Promise<void>;

  saveWithValuesMetadataType(
    eventType: EnvironmentAuditEventType,
    user: User,
    repository: VcsRepository,
    environment: Environment,
    metadata: ValuesMetadataType,
  ): Promise<void>;

  saveWithRollbackMetadataType(
    eventType: EnvironmentAuditEventType,
    user: User,
    repository: VcsRepository,
    environment: Environment,
    rollbackMetadata: RollbackMetadataType,
  ): Promise<void>;

  saveWithApiKeyMetadataType(
    eventType: EnvironmentAuditEventType,
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    apiKey: ApiKey,
  ): Promise<void>;

  saveAllWithPermissionMetadataType(
    eventType: EnvironmentAuditEventType,
    user: User,
    repository: VcsRepository,
    environment: Environment,
    previousEnvironmentPermissions: EnvironmentPermissionWithUser[],
    updatedEnvironmentPermissions: EnvironmentPermission[],
  ): Promise<void>;
}
