import EnvironmentAuditStoragePort from 'src/domain/port/out/environment-audit.storage.port';
import { Repository } from 'typeorm';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import EnvironmentAudit from 'src/domain/model/environment-audit/environment-audit.model';

export default class EnvironmentAuditAdapter
  implements EnvironmentAuditStoragePort
{
  constructor(
    private environmentAuditEntityRepository: Repository<EnvironmentAuditEntity>,
  ) {}

  async save(environmentAudit: EnvironmentAudit): Promise<void> {
    await this.environmentAuditEntityRepository.save(
      EnvironmentAuditEntity.fromDomain(environmentAudit),
    );
  }
}
