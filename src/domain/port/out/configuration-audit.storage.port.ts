import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';

export default interface ConfigurationAuditStoragePort {
  save(configurationAudit: ConfigurationAudit): Promise<void>;

  findById(id: string): Promise<ConfigurationAudit[]>;
}
