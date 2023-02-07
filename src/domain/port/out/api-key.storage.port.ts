import ApiKey from 'src/domain/model/configuration/api-key.model';

export default interface ApiKeyStoragePort {
  findById(environmentId: string, id: string): Promise<ApiKey | undefined>;
  findAllForEnvironmentId(environmentId: string): Promise<ApiKey[]>;

  save(apiKey: ApiKey): Promise<void>;

  delete(apiKey: ApiKey): Promise<void>;
}
