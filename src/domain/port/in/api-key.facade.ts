import User from 'src/domain/model/user.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import ApiKey from 'src/domain/model/environment/api-key.model';

export interface ApiKeyFacade {
  findApiKeyByHash(hash: string): Promise<ApiKey | undefined>;

  listApiKeysForUserAndEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ApiKey[]>;

  createApiKeyForEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
  ): Promise<ApiKey>;

  deleteApiKeyForEnvironment(
    user: User,
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    configurationId: string,
    environmentId: string,
    apiKeyId: string,
  ): Promise<void>;
}
