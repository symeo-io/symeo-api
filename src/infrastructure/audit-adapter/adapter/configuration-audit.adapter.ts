import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import { Repository } from 'typeorm';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import ConfigurationAuditStoragePort from 'src/domain/port/out/configuration-audit.storage.port';

export default class ConfigurationAuditAdapter
  implements ConfigurationAuditStoragePort
{
  constructor(
    private configurationAuditRepository: Repository<ConfigurationAuditEntity>,
  ) {}

  async findById(configurationId: string): Promise<ConfigurationAudit[]> {
    const entities = await this.configurationAuditRepository.findBy({
      configurationId: configurationId,
    });
    return entities.map((entity) => entity.toDomain());
  }

  async save(configurationAudit: ConfigurationAudit): Promise<void> {
    await this.configurationAuditRepository.save(
      ConfigurationAuditEntity.fromDomain(configurationAudit),
    );
  }
}
