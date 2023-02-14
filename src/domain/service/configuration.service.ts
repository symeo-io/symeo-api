import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import User from 'src/domain/model/user.model';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';
import { parse } from 'yaml';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';

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
        new Environment(uuid(), 'Staging', 'blue'),
        new Environment(uuid(), 'Production', 'red'),
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
}
