import { ValuesFacade } from 'src/domain/port/in/values.facade';
import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly configurationFacade: ConfigurationFacade,
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
  ) {}

  async findByEnvironmentId(
    environmentId: string,
  ): Promise<ConfigurationValues> {
    return await this.secretValuesStoragePort.getValuesForEnvironmentId(
      environmentId,
    );
  }

  async findByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ConfigurationValues> {
    const configuration = await this.configurationFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      vcsRepositoryId,
      configurationId,
    );

    const environment = configuration.environments.find(
      (env) => env.id === environmentId,
    );

    if (!environment) {
      throw new SymeoException(
        `No environment found with id ${environmentId}`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }

    return await this.secretValuesStoragePort.getValuesForEnvironment(
      environment,
    );
  }

  async updateByIdForUser(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    values: ConfigurationValues,
  ): Promise<void> {
    const configuration = await this.configurationFacade.findByIdForUser(
      user,
      VCSProvider.GitHub,
      vcsRepositoryId,
      configurationId,
    );

    const environment = configuration.environments.find(
      (env) => env.id === environmentId,
    );

    if (!environment) {
      throw new SymeoException(
        `No environment found with id ${environmentId}`,
        SymeoExceptionCode.ENVIRONMENT_NOT_FOUND,
      );
    }

    return await this.secretValuesStoragePort.setValuesForEnvironment(
      environment,
      values,
    );
  }
}
