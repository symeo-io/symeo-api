import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';
import ApiKey from 'src/domain/model/environment/api-key.model';
import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import Environment from 'src/domain/model/environment/environment.model';

export class ApiKeyService implements ApiKeyFacade {
  constructor(
    private readonly configurationFacade: ConfigurationFacade,
    private readonly apiKeyStoragePort: ApiKeyStoragePort,
  ) {}

  async findApiKeyByHash(hash: string): Promise<ApiKey | undefined> {
    return await this.apiKeyStoragePort.findByHash(hash);
  }

  async listApiKeysForUserAndEnvironment(
    environment: Environment,
  ): Promise<ApiKey[]> {
    return await this.apiKeyStoragePort.findAllForEnvironmentId(environment.id);
  }

  async createApiKeyForEnvironment(environment: Environment): Promise<ApiKey> {
    const apiKey = await ApiKey.buildForEnvironmentId(environment.id);
    await this.apiKeyStoragePort.save(apiKey);

    return apiKey;
  }

  async deleteApiKey(apiKey: ApiKey): Promise<void> {
    return await this.apiKeyStoragePort.delete(apiKey);
  }
}
