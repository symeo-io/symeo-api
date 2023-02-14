import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Configuration from 'src/domain/model/configuration/configuration.model';

export interface EnvironmentFacade {
  createEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Configuration>;

  deleteEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
    environmentId: string,
  ): Promise<void>;

  updateEnvironment(
    user: User,
    GitHub: VCSProvider,
    number: number,
    configurationId: string,
    id: string,
    name: string,
    environmentColor: EnvironmentColor,
  ): Promise<Configuration>;
}
