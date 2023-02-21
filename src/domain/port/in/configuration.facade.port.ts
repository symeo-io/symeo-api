import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import User from 'src/domain/model/user/user.model';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';

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
    contractFilePath: string,
    branch: string,
  ): Promise<{ isValid: boolean; message?: string }>;

  findContractByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<ConfigurationContract>;

  createForUser(
    user: User,
    name: string,
    repositoryVcsId: number,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration>;

  deleteByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<void>;
}
