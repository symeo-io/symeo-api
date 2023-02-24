import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Environment from 'src/domain/model/environment/environment.model';
import Configuration from 'src/domain/model/configuration/configuration.model';

export interface EnvironmentFacade {
  createEnvironment(
    configuration: Configuration,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment>;

  deleteEnvironment(environment: Environment): Promise<void>;

  updateEnvironment(
    environment: Environment,
    name: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment>;
}
