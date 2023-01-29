import Configuration from 'src/domain/model/configuration.model';
import {
  attribute,
  hashKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';
import { config } from 'symeo/config';

console.log('config', config);

@table(config.database.configuration.tableName)
export default class ConfigurationEntity {
  @hashKey()
  id?: string;

  @attribute()
  repositoryId?: string;

  public toDomain(): Configuration {
    return new Configuration(this.id as string, this.repositoryId as string);
  }

  static fromDomain(configuration: Configuration): ConfigurationEntity {
    const entity = new ConfigurationEntity();
    entity.id = configuration.id;
    entity.repositoryId = configuration.repositoryId;

    return entity;
  }
}
