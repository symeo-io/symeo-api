import ApiKey from 'src/domain/model/environment/api-key.model';
import Environment from 'src/domain/model/environment/environment.model';

export interface ApiKeyFacade {
  findApiKeyByHash(hash: string): Promise<ApiKey | undefined>;

  listApiKeysForUserAndEnvironment(environment: Environment): Promise<ApiKey[]>;

  createApiKeyForEnvironment(environment: Environment): Promise<ApiKey>;

  deleteApiKey(apiKey: ApiKey): Promise<void>;
}
