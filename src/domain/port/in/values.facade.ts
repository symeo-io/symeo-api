import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import Environment from 'src/domain/model/environment/environment.model';

export interface ValuesFacade {
  findByEnvironmentId(environmentId: string): Promise<ConfigurationValues>;

  updateByEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void>;
}
