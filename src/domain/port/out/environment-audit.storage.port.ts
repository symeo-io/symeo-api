import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';

export default interface EnvironmentAuditStoragePort {
  findById(environmentId: string): Promise<EnvironmentAudit[]>;

  save(environmentAudit: EnvironmentAudit): Promise<void>;

  saveAll(environmentAudits: EnvironmentAudit[]): Promise<void>;
}
