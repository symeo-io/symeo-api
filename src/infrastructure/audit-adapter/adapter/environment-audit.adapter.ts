import EnvironmentAuditStoragePort from 'src/domain/port/out/environment-audit.storage.port';
import { Repository } from 'typeorm';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';

export default class EnvironmentAuditAdapter
  implements EnvironmentAuditStoragePort
{
  constructor(
    private environmentAuditEntityRepository: Repository<EnvironmentAuditEntity>,
  ) {}

  async findById(environmentId: string): Promise<EnvironmentAudit[]> {
    const entities: EnvironmentAuditEntity[] =
      await this.environmentAuditEntityRepository.findBy({
        environmentId: environmentId,
      });
    return entities.map((entity) => entity.toDomain());
  }

  async save(environmentAudit: EnvironmentAudit): Promise<void> {
    await this.environmentAuditEntityRepository.save(
      EnvironmentAuditEntity.fromDomain(environmentAudit),
    );
  }

  async saveAll(environmentAudits: EnvironmentAudit[]): Promise<void> {
    await this.environmentAuditEntityRepository.save(
      environmentAudits.map((environmentAudit) =>
        EnvironmentAuditEntity.fromDomain(environmentAudit),
      ),
    );
  }
}
