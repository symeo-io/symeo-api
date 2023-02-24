import User from 'src/domain/model/user/user.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import GithubAdapterPort from 'src/domain/port/out/github.adapter.port';
import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import Environment from 'src/domain/model/environment/environment.model';

export class AuthorizationService {
  constructor(
    private githubAdapterPort: GithubAdapterPort,
    private configurationStoragePort: ConfigurationStoragePort,
  ) {}

  async hasUserAuthorizationToRepository(
    user: User,
    repositoryVcsId: number,
  ): Promise<{ repository: VcsRepository }> {
    const repository = await this.githubAdapterPort.getRepositoryById(
      user,
      repositoryVcsId,
    );

    if (!repository) {
      throw new SymeoException(
        `Repository not found for repositoryVcsId ${repositoryVcsId}`,
        SymeoExceptionCode.REPOSITORY_NOT_FOUND,
      );
    }
    return { repository };
  }

  async hasUserAuthorizationToConfiguration(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
  ): Promise<{ repository: VcsRepository; configuration: Configuration }> {
    const { repository } = await this.hasUserAuthorizationToRepository(
      user,
      repositoryVcsId,
    );

    const configuration =
      await this.configurationStoragePort.findByIdAndRepositoryVcsId(
        configurationId,
        repository.id,
      );

    if (!configuration) {
      throw new SymeoException(
        `Configuration not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId}`,
        SymeoExceptionCode.CONFIGURATION_NOT_FOUND,
      );
    }

    return { repository, configuration };
  }

  async hasUserAuthorizationToEnvironment(
    user: User,
    repositoryVcsId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<{
    repository: VcsRepository;
    configuration: Configuration;
    environment: Environment;
  }> {
    const { repository, configuration } =
      await this.hasUserAuthorizationToConfiguration(
        user,
        repositoryVcsId,
        configurationId,
      );

    const environment = configuration.environments.find(
      (environment: Environment) => environment.id === environmentId,
    );

    if (!environment) {
      throw new SymeoException(
        `Environment not found for repositoryVcsId ${repositoryVcsId} and configurationId ${configurationId} and environmentId ${environmentId}`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }

    return { repository, configuration, environment };
  }
}
