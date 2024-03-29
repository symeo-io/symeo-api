import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { ApiKeyFacade } from 'src/domain/port/in/api-key.facade';
import ApiKey from 'src/domain/model/environment/api-key.model';
import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import User from 'src/domain/model/user/user.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';

export class ApiKeyService implements ApiKeyFacade {
  constructor(
    private readonly configurationFacade: ConfigurationFacade,
    private readonly apiKeyStoragePort: ApiKeyStoragePort,
    private environmentAuditFacade: EnvironmentAuditFacade,
  ) {}

  async findApiKeyByHash(hash: string): Promise<ApiKey | undefined> {
    return await this.apiKeyStoragePort.findByHash(hash);
  }

  async listApiKeysForUserAndEnvironment(
    environment: Environment,
  ): Promise<ApiKey[]> {
    return await this.apiKeyStoragePort.findAllForEnvironmentId(environment.id);
  }

  async createApiKeyForEnvironment(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
  ): Promise<ApiKey> {
    const apiKey = await ApiKey.buildForEnvironmentId(environment.id);
    await this.apiKeyStoragePort.save(apiKey);
    await this.environmentAuditFacade.saveWithApiKeyMetadataType(
      EnvironmentAuditEventType.API_KEY_CREATED,
      currentUser,
      repository,
      environment,
      apiKey,
    );

    return apiKey;
  }

  async deleteApiKey(
    currentUser: User,
    repository: VcsRepository,
    environment: Environment,
    apiKey: ApiKey,
  ): Promise<void> {
    await this.apiKeyStoragePort.delete(apiKey);
    await this.environmentAuditFacade.saveWithApiKeyMetadataType(
      EnvironmentAuditEventType.API_KEY_DELETED,
      currentUser,
      repository,
      environment,
      apiKey,
    );
  }
}
