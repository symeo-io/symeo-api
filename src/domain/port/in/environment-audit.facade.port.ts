import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';

export default interface EnvironmentAuditFacade {
  findEnvironmentAudits(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
  ): Promise<EnvironmentAudit[]>;
}
