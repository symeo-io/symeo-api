import User from 'src/domain/model/user/user.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';

export class CheckAuthorizationService {
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private configurationStoragePort: ConfigurationStoragePort,
  ) {}

  async hasUserAuthorizationToVcsRepositoryAndConfigurationAndEnvironment(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<{
    vcsRepository: VcsRepository;
    configuration: Configuration;
    environment: Environment;
  }> {
    const vcsRepositoryAndConfigurationAuthorization =
      await this.hasUserAuthorizationToVcsRepositoryAndConfiguration(
        user,
        repositoryVcsId,
        configurationId,
      );

    const environment =
      vcsRepositoryAndConfigurationAuthorization.configuration.environments.find(
        (environment: Environment) => environment.id === environmentId,
      );

    if (!environment) {
      throw new SymeoException(
        `Environment not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId} and environmentId ${environmentId}`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }

    return {
      vcsRepository: vcsRepositoryAndConfigurationAuthorization.vcsRepository,
      configuration: vcsRepositoryAndConfigurationAuthorization.configuration,
      environment: environment,
    };
  }

  async hasUserAuthorizationToVcsRepositoryAndConfiguration(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
  ): Promise<{ vcsRepository: VcsRepository; configuration: Configuration }> {
    const vcsRepositoryAuthorization =
      await this.hasUserAuthorizationToRepository(user, repositoryVcsId);

    const configuration =
      await this.configurationStoragePort.findByIdAndRepositoryVcsId(
        configurationId,
        repositoryVcsId,
      );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return {
      vcsRepository: vcsRepositoryAuthorization.vcsRepository,
      configuration: configuration,
    };
  }

  async hasUserAuthorizationToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<{ vcsRepository: VcsRepository }> {
    const vcsRepository = await this.githubAdapterPort.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!vcsRepository) {
      throw new SymeoException(
        `Repository not found for repositoryVcsId ${repositoryVcsId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }
    return { vcsRepository: vcsRepository };
  }
}
