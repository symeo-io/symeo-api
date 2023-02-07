import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import User from 'src/domain/model/user.model';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/configuration/environment.model';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';
import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';
import { parse } from 'yaml';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import { NotFoundException } from '@nestjs/common';

export default class ConfigurationService implements ConfigurationFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
    private readonly repositoryFacade: RepositoryFacade,
  ) {}

  async findByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration> {
    const [hasUserAccessToRepository, configuration] = await Promise.all([
      this.repositoryFacade.hasAccessToRepository(user, vcsRepositoryId),
      this.configurationStoragePort.findById(
        VCSProvider.GitHub,
        vcsRepositoryId,
        id,
      ),
    ]);

    if (!hasUserAccessToRepository || !configuration) {
      throw new SymeoException(
        `Configuration not found for id ${id}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return configuration;
  }

  async findAllForRepositoryIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<Configuration[]> {
    const hasUserAccessToRepository =
      await this.repositoryFacade.hasAccessToRepository(user, vcsRepositoryId);

    if (!hasUserAccessToRepository) {
      throw new SymeoException(
        `Repository not found for id ${vcsRepositoryId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }

    return await this.configurationStoragePort.findAllForRepositoryId(
      vcsType,
      vcsRepositoryId,
    );
  }

  async validateCreateForUser(
    user: User,
    repositoryVcsId: number,
    configFormatFilePath: string,
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
        configFormatFilePath,
        branch,
      );

    if (!fileExistsOnBranch) {
      return {
        isValid: false,
        message: `No ${configFormatFilePath} on branch ${branch}`,
      };
    }

    return { isValid: true };
  }

  async findFormatByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<ConfigurationFormat> {
    const configuration = await this.configurationStoragePort.findById(
      VCSProvider.GitHub,
      vcsRepositoryId,
      id,
    );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for id ${id}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    const configFormatString = await this.repositoryFacade.getFileContent(
      user,
      configuration.owner.name,
      configuration.repository.name,
      configuration.configFormatFilePath,
      configuration.branch,
    );

    if (!configFormatString) {
      throw new SymeoException(
        `Configuration file not found at ${configuration.configFormatFilePath} on ${configuration.branch}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return parse(configFormatString) as ConfigurationFormat;
  }

  async createForUser(
    user: User,
    name: string,
    repositoryVcsId: number,
    configFormatFilePath: string,
    branch: string,
  ): Promise<Configuration> {
    const repository = await this.repositoryFacade.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!repository) {
      throw new SymeoException(
        `Repository not found for repositoryVcsId ${repositoryVcsId}`,
        SymeoExceptionCode.WRONG_REPOSITORY_DETAILS,
      );
    }

    const fileExistsOnBranch =
      await this.repositoryFacade.checkFileExistsOnBranch(
        user,
        repository.owner.name,
        repository.name,
        configFormatFilePath,
        branch,
      );

    if (!fileExistsOnBranch) {
      throw new SymeoException(
        `Config file not found at ${configFormatFilePath} on branch ${branch}`,
        SymeoExceptionCode.WRONG_CONFIG_FILE_DETAILS,
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
      configFormatFilePath,
      branch,
      [
        new Environment(uuid(), 'Staging', EnvironmentColor.blue),
        new Environment(uuid(), 'Production', EnvironmentColor.red),
      ],
    );

    await this.configurationStoragePort.save(configuration);
    return configuration;
  }
  async deleteByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<void> {
    const configuration = await this.findByIdForUser(
      user,
      VCSProvider.GitHub,
      vcsRepositoryId,
      id,
    );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for id ${id}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return this.configurationStoragePort.delete(configuration);
  }

  async createEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Configuration> {
    const [hasUserAccessToRepository, configuration] = await Promise.all([
      this.repositoryFacade.hasAccessToRepository(user, vcsRepositoryId),
      this.configurationStoragePort.findById(
        VCSProvider.GitHub,
        vcsRepositoryId,
        configurationId,
      ),
    ]);
    if (!hasUserAccessToRepository || !configuration) {
      throw new SymeoException(
        `Configuration not found for id ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    const environment: Environment = new Environment(
      uuid(),
      environmentName,
      environmentColor,
    );
    configuration.environments.push(environment);
    await this.configurationStoragePort.save(configuration);
    return configuration;
  }

  async deleteEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<void> {
    const [hasUserAccessToRepository, configuration] = await Promise.all([
      this.repositoryFacade.hasAccessToRepository(user, vcsRepositoryId),
      this.configurationStoragePort.findById(
        VCSProvider.GitHub,
        vcsRepositoryId,
        configurationId,
      ),
    ]);
    if (!hasUserAccessToRepository || !configuration) {
      throw new SymeoException(
        `Configuration not found for id ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }
    const indexOfEnvironmentToRemove: number =
      configuration.environments.findIndex(
        (environment) => environment.id === environmentId,
      );
    if (indexOfEnvironmentToRemove > -1) {
      configuration.environments.splice(indexOfEnvironmentToRemove, 1);
      await this.configurationStoragePort.save(configuration);
    } else {
      throw new SymeoException(
        `The environment to update with the id ${environmentId} was not found`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }
  }

  async updateEnvironment(
    user: User,
    vcsProvider: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    environmentName: string,
    environmentColor: EnvironmentColor,
  ): Promise<Configuration> {
    const [hasUserAccessToRepository, configuration] = await Promise.all([
      this.repositoryFacade.hasAccessToRepository(user, vcsRepositoryId),
      this.configurationStoragePort.findById(
        VCSProvider.GitHub,
        vcsRepositoryId,
        configurationId,
      ),
    ]);
    if (!hasUserAccessToRepository || !configuration) {
      throw new SymeoException(
        `Configuration not found for id ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }
    const indexOfEnvironmentToUpdate: number =
      configuration.environments.findIndex(
        (environment) => environment.id === environmentId,
      );
    if (indexOfEnvironmentToUpdate > -1) {
      configuration.environments[indexOfEnvironmentToUpdate] = new Environment(
        environmentId,
        environmentName,
        environmentColor,
      );
      await this.configurationStoragePort.save(configuration);
      return configuration;
    }
    throw new SymeoException(
      `The environment to update with the id ${environmentId} was not found`,
      SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
    );
  }
}
