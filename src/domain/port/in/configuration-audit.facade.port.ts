import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';

export default interface ConfigurationAuditFacade {
  findConfigurationAudits(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<ConfigurationAudit[]>;

  save(
    eventType: ConfigurationAuditEventType,
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    branch?: string,
    contractFilePath?: string,
  ): Promise<void>;
}
