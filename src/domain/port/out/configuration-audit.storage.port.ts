import ConfigurationAudit from 'src/domain/model/configuration-audit/configuration-audit.model';

export default interface ConfigurationAuditStoragePort {
  save(configurationAudit: ConfigurationAudit): Promise<void>;
}
