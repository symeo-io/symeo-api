import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import Environment from 'src/domain/model/environment/environment.model';

export interface ValuesFacade {
  findByEnvironmentId(environmentId: string): Promise<ConfigurationValues>;

  updateByEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void>;
}
