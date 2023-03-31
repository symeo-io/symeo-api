import { Repository } from 'typeorm';
import EnvironmentAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/environment-audit.entity';
import { AppClient } from 'tests/utils/app.client';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { faker } from '@faker-js/faker';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/audit/environment-audit/environment-audit-metadata';

export class EnvironmentAuditTestUtil {
  public repository: Repository<EnvironmentAuditEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<Repository<EnvironmentAuditEntity>>(
      getRepositoryToken(EnvironmentAuditEntity),
    );
  }

  async createEnvironmentAudit(
    repositoryId: number,
    configurationId: string,
    environmentId: string,
    eventType: EnvironmentAuditEventType,
    metadata: EnvironmentAuditMetadata,
  ): Promise<EnvironmentAuditEntity> {
    const environmentAuditEntity = new EnvironmentAuditEntity();
    environmentAuditEntity.environmentId = environmentId;
    environmentAuditEntity.eventType = eventType;
    environmentAuditEntity.repositoryVcsId = repositoryId;
    environmentAuditEntity.userId = `github|${faker.datatype.number({
      min: 111111,
      max: 999999,
    })}`;
    environmentAuditEntity.userName = faker.name.firstName();
    environmentAuditEntity.metadata = metadata;

    await this.repository.save(environmentAuditEntity);
    return environmentAuditEntity;
  }

  public empty() {
    this.repository.delete({});
  }
}
