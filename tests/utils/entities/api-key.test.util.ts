import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import ApiKeyEntity from 'src/infrastructure/postgres-adapter/entity/api-key.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import Environment from 'src/domain/model/environment/environment.model';
import ApiKey from 'src/domain/model/environment/api-key.model';

export class ApiKeyTestUtil {
  public repository: Repository<ApiKeyEntity>;
  constructor(appClient: AppClient) {
    this.repository = appClient.module.get<Repository<ApiKeyEntity>>(
      getRepositoryToken(ApiKeyEntity),
    );
  }

  public async createApiKey(environment: Environment): Promise<ApiKeyEntity> {
    const apiKey = await ApiKey.buildForEnvironmentId(environment.id);
    const apiKeyEntity = ApiKeyEntity.fromDomain(apiKey);

    await this.repository.save(apiKeyEntity);

    return apiKeyEntity;
  }
  public empty() {
    return this.repository.delete({});
  }
}
