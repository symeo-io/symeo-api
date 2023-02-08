import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { SymeoException } from 'src/domain/exception/symeo.exception';
import { SymeoExceptionCode } from 'src/domain/exception/symeo.exception.code.enum';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';

export class ApiKeyService implements ApiKeyFacade {
  constructor(
    private readonly configurationFacade: ConfigurationFacade,
    private readonly apiKeyStoragePort: ApiKeyStoragePort,
  ) {}

  async findApiKeyById(
    environmentId: string,
    id: string,
  ): Promise<ApiKey | undefined> {
    return await this.apiKeyStoragePort.findById(environmentId, id);
  }

  async listApiKeysForUserAndEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ApiKey[]> {
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

    return await this.apiKeyStoragePort.findAllForEnvironmentId(environmentId);
  }

  async createApiKeyForEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ApiKey> {
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

    const apiKey = ApiKey.buildForEnvironmentId(environmentId);
    await this.apiKeyStoragePort.save(apiKey);

    return apiKey;
  }

  async deleteApiKeyForEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    apiKeyId: string,
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

    const apiKey = await this.apiKeyStoragePort.findById(
      environmentId,
      apiKeyId,
    );

    if (!apiKey) {
      throw new SymeoException(
        `No api key found with id ${apiKeyId}`,
        SymeoExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    return await this.apiKeyStoragePort.delete(apiKey);
  }
}
