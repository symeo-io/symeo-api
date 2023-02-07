import { EnvironmentFacade } from 'src/domain/port/in/environment.facade.port';
import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';
import Configuration from 'src/domain/model/configuration/configuration.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import Environment from 'src/domain/model/environment/environment.model';
import { v4 as uuid } from 'uuid';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';

export class EnvironmentService implements EnvironmentFacade {
  constructor(
    private configurationStoragePort: ConfigurationStoragePort,
    private repositoryFacade: RepositoryFacade,
  ) {}

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
    if (indexOfEnvironmentToRemove === -1) {
      throw new SymeoException(
        `The environment to update with the id ${environmentId} was not found`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }
    configuration.environments.splice(indexOfEnvironmentToRemove, 1);
    await this.configurationStoragePort.save(configuration);
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
    if (indexOfEnvironmentToUpdate === -1) {
      throw new SymeoException(
        `The environment to update with the id ${environmentId} was not found`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }
    configuration.environments[indexOfEnvironmentToUpdate] = new Environment(
      environmentId,
      environmentName,
      environmentColor,
    );
    await this.configurationStoragePort.save(configuration);
    return configuration;
  }
}
