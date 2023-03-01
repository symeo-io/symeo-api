import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import User from 'src/domain/model/user/user.model';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/environment/environment.model';
import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { parse } from 'yaml';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionStoragePort } from 'src/domain/port/out/environment-permission.storage.port';

export default class ConfigurationService implements ConfigurationFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
    private readonly repositoryFacade: RepositoryFacade,
    private readonly environmentPermissionStoragePort: EnvironmentPermissionStoragePort,
  ) {}

  async findById(
    repository: VcsRepository,
    id: string,
  ): Promise<Configuration> {
    const configuration = await this.configurationStoragePort.findById(
      repository.vcsType,
      repository.id,
      id,
    );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for id ${id}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return configuration;
  }

  async findAllForRepository(
    repository: VcsRepository,
  ): Promise<Configuration[]> {
    return await this.configurationStoragePort.findAllForRepositoryId(
      repository.vcsType,
      repository.id,
    );
  }

  async validateCreateForUser(
    user: User,
    repositoryVcsId: number,
    contractFilePath: string,
    branch: string,
  ): Promise<{ isValid: boolean; message?: string }> {
    const repository = await this.repositoryFacade.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!repository) {
      return {
        isValid: false,
        message: `No repository found with id ${repositoryVcsId}`,
      };
    }

    const fileExistsOnBranch =
      await this.repositoryFacade.checkFileExistsOnBranch(
        user,
        repository.owner.name,
        repository.name,
        contractFilePath,
        branch,
      );

    if (!fileExistsOnBranch) {
      return {
        isValid: false,
        message: `No ${contractFilePath} on branch ${branch}`,
      };
    }

    return { isValid: true };
  }

  async findContract(
    user: User,
    configuration: Configuration,
    branchName?: string,
  ): Promise<ConfigurationContract> {
    const requestedBranchName = branchName ?? configuration.branch;
    const contractString = await this.repositoryFacade.getFileContent(
      user,
      configuration.owner.name,
      configuration.repository.name,
      configuration.contractFilePath,
      requestedBranchName,
    );

    if (!contractString) {
      throw new SymeoException(
        `Configuration contract file not found at ${configuration.contractFilePath} on ${requestedBranchName}`,
        SymeoExceptionCode.CONFIGURATION_CONTRACT_NOT_FOUND,
      );
    }

    return parse(contractString) as ConfigurationContract;
  }

  async findUserEnvironmentsPermissions(
    user: User,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]> {
    return this.environmentPermissionStoragePort.findForEnvironmentIdsAndVcsUserId(
      configuration.environments.map((environment) => environment.id),
      user.getVcsUserId(),
    );
  }

  async createForRepository(
    user: User,
    repository: VcsRepository,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration> {
    const fileExistsOnBranch =
      await this.repositoryFacade.checkFileExistsOnBranch(
        user,
        repository.owner.name,
        repository.name,
        contractFilePath,
        branch,
      );

    if (!fileExistsOnBranch) {
      throw new SymeoException(
        `Config file not found at ${contractFilePath} on branch ${branch}`,
        SymeoExceptionCode.CONFIGURATION_CONTRACT_NOT_FOUND,
      );
    }

    const configuration = new Configuration(
      uuid(),
      name,
      VCSProvider.GitHub,
      {
        name: repository.name,
        vcsId: repository.id,
      },
      {
        name: repository.owner.name,
        vcsId: repository.owner.id,
      },
      contractFilePath,
      branch,
      [
        new Environment(uuid(), 'Staging', 'blue'),
        new Environment(uuid(), 'Production', 'red'),
      ],
    );

    await this.configurationStoragePort.save(configuration);
    return configuration;
  }

  async update(
    configuration: Configuration,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration> {
    configuration.name = name;
    configuration.contractFilePath = contractFilePath;
    configuration.branch = branch;

    await this.configurationStoragePort.save(configuration);

    return configuration;
  }

  async delete(configuration: Configuration): Promise<void> {
    return this.configurationStoragePort.delete(configuration);
  }
}
