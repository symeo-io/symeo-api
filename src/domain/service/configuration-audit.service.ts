import ConfigurationAuditStoragePort from 'src/domain/port/out/configuration-audit.storage.port';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import ConfigurationAuditFacade from 'src/domain/port/in/configuration-audit.facade.port';

export default class ConfigurationAuditService
  implements ConfigurationAuditFacade
{
  constructor(
    private readonly configurationAuditStoragePort: ConfigurationAuditStoragePort,
  ) {}

  async findConfigurationAudits(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<ConfigurationAudit[]> {
    return await this.configurationAuditStoragePort.findById(configuration.id);
  }

  async save(
    configurationAuditEventType: ConfigurationAuditEventType,
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    branch?: string,
    contractFilePath?: string,
  ) {
    const configurationAudit = new ConfigurationAudit(
      configuration.id,
      ConfigurationAuditEventType.CREATED,
      repository.id,
      user.id,
      user.username,
      {
        metadata: {
          name: configuration.name,
          branch: branch,
          contractFilePath: contractFilePath,
        },
      },
      new Date(),
    );
    await this.configurationAuditStoragePort.save(configurationAudit);
  }
}
