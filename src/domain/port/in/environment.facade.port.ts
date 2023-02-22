import User from 'src/domain/model/user/user.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import Environment from 'src/domain/model/environment/environment.model';

export interface EnvironmentFacade {
  createEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Environment>;

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
  ): Promise<Environment>;
}
