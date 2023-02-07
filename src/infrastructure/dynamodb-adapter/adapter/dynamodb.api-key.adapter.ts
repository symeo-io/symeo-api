import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import ApiKeyRepository from 'src/infrastructure/dynamodb-adapter/repository/api-key.repository';
import ApiKeyEntity from 'src/infrastructure/dynamodb-adapter/entity/api-key.entity';

export default class DynamodbApiKeyAdapter implements ApiKeyStoragePort {
  constructor(private apiKeyRepository: ApiKeyRepository) {}
  async findById(
    environmentId: string,
    id: string,
  ): Promise<ApiKey | undefined> {
    const entity = await this.apiKeyRepository.findById(environmentId, id);

    if (!entity) return undefined;

    return entity.toDomain();
  }

  async findAllForEnvironmentId(environmentId: string): Promise<ApiKey[]> {
    const entities = await this.apiKeyRepository.findAllForEnvironmentId(
      environmentId,
    );
    return entities.map((entity) => entity.toDomain());
  }

  save(apiKey: ApiKey): Promise<void> {
    return this.apiKeyRepository.save(ApiKeyEntity.fromDomain(apiKey));
  }

  delete(apiKey: ApiKey): Promise<void> {
    return this.apiKeyRepository.delete(ApiKeyEntity.fromDomain(apiKey));
  }
}
