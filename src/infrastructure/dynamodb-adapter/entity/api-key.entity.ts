import {
  attribute,
  hashKey,
  table,
  rangeKey,
} from '@aws/dynamodb-data-mapper-annotations';
import { config } from 'symeo/config';
import AbstractEntity from 'src/infrastructure/dynamodb-adapter/entity/abstract.entity';
import ApiKey from 'src/domain/model/configuration/api-key.model';

@table(config.database.apiKey.tableName)
export default class ApiKeyEntity extends AbstractEntity {
  @hashKey()
  hashKey: string;

  @rangeKey()
  rangeKey: string;

  @attribute()
  id: string;

  @attribute()
  environmentId: string;

  @attribute()
  key: string;

  public toDomain(): ApiKey {
    return new ApiKey(this.id, this.environmentId, this.key);
  }

  static fromDomain(apiKey: ApiKey): ApiKeyEntity {
    const entity = new ApiKeyEntity();
    entity.hashKey = apiKey.environmentId;
    entity.rangeKey = apiKey.id;
    entity.id = apiKey.id;
    entity.environmentId = apiKey.environmentId;
    entity.key = apiKey.key;

    return entity;
  }
}
