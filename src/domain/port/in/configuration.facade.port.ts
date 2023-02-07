import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import User from 'src/domain/model/user.model';
import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';
import Environment from 'src/domain/model/configuration/environment.model';

export default interface ConfigurationFacade {
  findByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration>;

  findAllForRepositoryIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<Configuration[]>;

  validateCreateForUser(
    user: User,
    repositoryVcsId: number,
    configFormatFilePath: string,
    branch: string,
  ): Promise<{ isValid: boolean; message?: string }>;

  findFormatByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<ConfigurationFormat>;
  createForUser(
    user: User,
    name: string,
    repositoryVcsId: number,
    configFormatFilePath: string,
    branch: string,
  ): Promise<Configuration>;

  deleteByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<void>;

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
}
