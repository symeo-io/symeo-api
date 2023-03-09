import EnvironmentAudit from 'src/domain/model/environment-audit/environment-audit.model';

export default interface EnvironmentAuditStoragePort {
  save(environmentAudit: EnvironmentAudit): Promise<void>;
}
