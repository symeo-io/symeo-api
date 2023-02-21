import ApiKey from 'src/domain/model/environment/api-key.model';

export default interface ApiKeyStoragePort {
  findById(id: string): Promise<ApiKey | undefined>;

  findByHash(hash: string): Promise<ApiKey | undefined>;

  findAllForEnvironmentId(environmentId: string): Promise<ApiKey[]>;

  save(apiKey: ApiKey): Promise<void>;

  delete(apiKey: ApiKey): Promise<void>;
}
