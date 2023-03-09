import { Repository } from 'typeorm';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { AppClient } from 'tests/utils/app.client';
import { getRepositoryToken } from '@nestjs/typeorm';

export class ConfigurationAuditTestUtil {
  public repository: Repository<ConfigurationAuditEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<
      Repository<ConfigurationAuditEntity>
    >(getRepositoryToken(ConfigurationAuditEntity));
  }

  public empty() {
    return this.repository.delete({});
  }
}
