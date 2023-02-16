import ApiKeyStoragePort from 'src/domain/port/out/api-key.storage.port';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import { Repository } from 'typeorm';

export default class PostgresApiKeyAdapter implements ApiKeyStoragePort {
  constructor(private apiKeyRepository: Repository<ApiKeyEntity>) {}
  async findById(id: string): Promise<ApiKey | undefined> {
    const entity = await this.apiKeyRepository.findOneBy({ id });

    if (!entity) return undefined;

    return entity.toDomain();
  }

  async findByKey(key: string): Promise<ApiKey | undefined> {
    const entity = await this.apiKeyRepository.findOneBy({ key });

    if (!entity) return undefined;

    return entity.toDomain();
  }

  async findAllForEnvironmentId(environmentId: string): Promise<ApiKey[]> {
    const entities = await this.apiKeyRepository.findBy({ environmentId });
    return entities.map((entity) => entity.toDomain());
  }

  async save(apiKey: ApiKey): Promise<void> {
    await this.apiKeyRepository.save(ApiKeyEntity.fromDomain(apiKey));
  }

  async delete(apiKey: ApiKey): Promise<void> {
    await this.apiKeyRepository.delete({ id: apiKey.id });
  }
}
