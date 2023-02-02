import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { DynamoDBClient } from 'src/infrastructure/dynamodb-adapter/dynamodb.client';

export default class ConfigurationRepository {
  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  public async findById(id: string): Promise<ConfigurationEntity | undefined> {
    try {
      return await this.dynamoDBClient.dataMapper.get(
        Object.assign(new ConfigurationEntity(), { id }),
      );
    } catch (e) {
      if ((e as Error).name !== 'ItemNotFoundException') {
        throw e;
      }

      return undefined;
    }
  }

  public async save(configuration: ConfigurationEntity): Promise<void> {
    configuration.updatedAt = new Date();
    await this.dynamoDBClient.dataMapper.put(configuration);
  }
}
