import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Environment from 'src/domain/model/environment/environment.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export interface EnvironmentFacade {
  createEnvironment(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment>;

  deleteEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<void>;

  updateEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    name: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment>;
}
