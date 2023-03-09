import EnvironmentAuditStoragePort from 'src/domain/port/out/environment-audit.storage.port';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentAuditEventType } from 'src/domain/model/environment-audit/environment-audit-event-type.enum';
import Environment from 'src/domain/model/environment/environment.model';
import EnvironmentAudit from 'src/domain/model/environment-audit/environment-audit.model';
import { EnvironmentMetadataType } from 'src/domain/model/environment-audit/environment-audit-metadata';

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
}
