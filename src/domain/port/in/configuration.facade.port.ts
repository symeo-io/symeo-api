import Configuration from 'src/domain/model/configuration/configuration.model';
import User from 'src/domain/model/user/user.model';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';

export default interface ConfigurationFacade {
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

  findUserEnvironmentsPermissions(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]>;

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
