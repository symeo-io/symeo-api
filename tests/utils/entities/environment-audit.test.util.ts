import { Repository } from 'typeorm';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { AppClient } from 'tests/utils/app.client';
import { getRepositoryToken } from '@nestjs/typeorm';

export class EnvironmentAuditTestUtil {
  public repository: Repository<EnvironmentAuditEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<Repository<EnvironmentAuditEntity>>(
      getRepositoryToken(EnvironmentAuditEntity),
    );
  }

  public empty() {
    this.repository.delete({});
  }
}
