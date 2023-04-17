import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
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
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditFacade from 'src/domain/port/in/configuration-audit.facade.port';

export default class ConfigurationService implements ConfigurationFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
    private readonly repositoryFacade: RepositoryFacade,
    private readonly environmentPermissionFacade: EnvironmentPermissionFacade,
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private readonly configurationAuditFacade: ConfigurationAuditFacade,
  ) {}

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
        repository.id,
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
      configuration.repository.vcsId,
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
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<EnvironmentPermission[]> {
    return this.environmentPermissionFacade.findForConfigurationAndUser(
      user,
      repository,
      configuration,
    );
  }

  async createForRepository(
    currentUser: User,
    repository: VcsRepository,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration> {
    const fileExistsOnBranch =
      await this.repositoryFacade.checkFileExistsOnBranch(
        currentUser,
        repository.id,
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
      currentUser.provider,
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

    await this.configurationAuditFacade.save(
      ConfigurationAuditEventType.CREATED,
      currentUser,
      repository,
      configuration,
      branch,
      contractFilePath,
    );

    return configuration;
  }

  async update(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    name: string,
    contractFilePath: string,
    branch: string,
  ): Promise<Configuration> {
    configuration.name = name;
    configuration.contractFilePath = contractFilePath;
    configuration.branch = branch;

    await this.configurationStoragePort.save(configuration);

    await this.configurationAuditFacade.save(
      ConfigurationAuditEventType.UPDATED,
      currentUser,
      repository,
      configuration,
      branch,
      contractFilePath,
    );

    return configuration;
  }

  async delete(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
  ): Promise<void> {
    await Promise.all(
      configuration.environments.map((environment) =>
        this.secretValuesStoragePort.deleteValuesForEnvironment(environment),
      ),
    );
    await this.configurationAuditFacade.save(
      ConfigurationAuditEventType.DELETED,
      currentUser,
      repository,
      configuration,
    );
    return this.configurationStoragePort.delete(configuration);
  }
}
