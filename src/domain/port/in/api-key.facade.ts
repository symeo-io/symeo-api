import ApiKey from 'src/domain/model/environment/api-key.model';
import Environment from 'src/domain/model/environment/environment.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';

export interface ApiKeyFacade {
  findApiKeyByHash(hash: string): Promise<ApiKey | undefined>;

  listApiKeysForUserAndEnvironment(environment: Environment): Promise<ApiKey[]>;

  createApiKeyForEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<ApiKey>;

  deleteApiKey(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    apiKey: ApiKey,
  ): Promise<void>;
}
