import { Repository } from 'typeorm';
import ConfigurationAuditEntity from 'src/infrastructure/postgres-adapter/entity/audit/configuration-audit.entity';
import { AppClient } from 'tests/utils/app.client';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import { faker } from '@faker-js/faker';

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

  async createConfigurationAudit(
    configurationAuditId: number,
    repositoryId: number,
    configurationId: string,
    eventType: ConfigurationAuditEventType,
  ): Promise<ConfigurationAuditEntity> {
    const configurationAudit = new ConfigurationAuditEntity();
    configurationAudit.id = configurationAuditId;
    configurationAudit.configurationId = configurationId;
    configurationAudit.eventType = eventType;
    configurationAudit.repositoryVcsId = repositoryId;
    configurationAudit.userId = `github|${faker.datatype.number({
      min: 111111,
      max: 999999,
    })}`;
    configurationAudit.userName = faker.name.firstName();
    configurationAudit.metadata = {
      metadata: {
        name: faker.name.firstName(),
        branch: faker.name.firstName(),
        contractFilePath: faker.datatype.string(),
      },
    };
    await this.repository.save(configurationAudit);
    return configurationAudit;
  }
}
