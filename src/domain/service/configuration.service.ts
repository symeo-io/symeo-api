import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import User from 'src/domain/model/user.model';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import Environment from 'src/domain/model/configuration/environment.model';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';
import { ConfigurationFormat } from 'src/domain/model/configuration/configuration-format.model';
import { parse } from 'yaml';

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
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
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
      throw new NotFoundException({
        message: `No repository found with id ${vcsRepositoryId}`,
      }); // TODO implement error management;
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
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management;
    }

    const configFormatString = await this.repositoryFacade.getFileContent(
      user,
      configuration.owner.name,
      configuration.repository.name,
      configuration.configFormatFilePath,
      configuration.branch,
    );

    if (!configFormatString) {
      throw new NotFoundException({
        message: `No configuration file found at ${configuration.configFormatFilePath} on ${configuration.branch}`,
      }); // TODO implement error management;
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
      throw new BadRequestException({
        message: `No repository found with id ${repositoryVcsId}`,
      }); // TODO implement error management
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
      throw new BadRequestException({
        message: `No ${configFormatFilePath} on branch ${branch}`,
      }); // TODO implement error management
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
      throw new NotFoundException({
        message: `No configuration found with id ${id}`,
      }); // TODO implement error management
    }

    return this.configurationStoragePort.delete(configuration);
  }
}
