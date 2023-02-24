import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import User from 'src/domain/model/user/user.model';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export default interface ConfigurationFacade {
  findById(repository: VcsRepository, id: string): Promise<Configuration>;

  findByIdForUser(
    user: User,
    vcsType: VCSProvider,
    repositoryVcsId: number,
    id: string,
  ): Promise<Configuration>;

  findAllForRepository(repository: VcsRepository): Promise<Configuration[]>;

  validateCreateForUser(
    user: User,
    repositoryVcsId: number,
    contractFilePath: string,
    branch: string,
  ): Promise<{ isValid: boolean; message?: string }>;

  findContract(
    user: User,
    configuration: Configuration,
    branchName?: string,
  ): Promise<ConfigurationContract>;

  createForRepository(
    user: User,
    repository: VcsRepository,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration>;

  update(
    configuration: Configuration,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration>;

  delete(configuration: Configuration): Promise<void>;
}
