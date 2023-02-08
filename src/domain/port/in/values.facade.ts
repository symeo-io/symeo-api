import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export interface ValuesFacade {
  findByEnvironmentId(environmentId: string): Promise<ConfigurationValues>;

  findByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ConfigurationValues>;

  updateByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    values: ConfigurationValues,
  ): Promise<void>;
}
