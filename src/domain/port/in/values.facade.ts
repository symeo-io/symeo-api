import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import User from 'src/domain/model/user/user.model';
import Environment from 'src/domain/model/environment/environment.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export interface ValuesFacade {
  findByEnvironmentForSdk(environmentId: string): Promise<ConfigurationValues>;

  getHiddenValuesByEnvironmentForWebapp(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    branch: string | undefined,
    environment: Environment,
  ): Promise<ConfigurationValues>;

  getNonHiddenValuesByEnvironmentForWebapp(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    branch: string | undefined,
    environment: Environment,
  ): Promise<ConfigurationValues>;

  updateValuesByEnvironmentForWebapp(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
    branch: string | undefined,
    values: ConfigurationValues,
  ): Promise<void>;
}
