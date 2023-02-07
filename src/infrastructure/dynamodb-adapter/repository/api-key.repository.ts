import { DynamoDBClient } from 'src/infrastructure/dynamodb-adapter/dynamodb.client';
import ApiKeyEntity from 'src/infrastructure/dynamodb-adapter/entity/api-key.entity';

export default class ApiKeyRepository {
  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  public async findById(
    environmentId: string,
    id: string,
  ): Promise<ApiKeyEntity | undefined> {
    try {
      return await this.dynamoDBClient.dataMapper.get(
        Object.assign(new ApiKeyEntity(), {
          rangeKey: id,
          hashKey: environmentId,
        }),
      );
    } catch (exception) {
      if ((exception as Error).name !== 'ItemNotFoundException') {
        throw exception;
      }

      return undefined;
    }
  }

  public async findAllForEnvironmentId(
    environmentId: string,
  ): Promise<ApiKeyEntity[]> {
    const apiKeys: ApiKeyEntity[] = [];
    for await (const apiKey of this.dynamoDBClient.dataMapper.query(
      ApiKeyEntity,
      {
        hashKey: environmentId,
      },
    )) {
      apiKeys.push(apiKey);
    }

    return apiKeys;
  }

  public async save(apiKey: ApiKeyEntity): Promise<void> {
    apiKey.updatedAt = new Date();
    await this.dynamoDBClient.dataMapper.put(apiKey);
  }

  public async delete(apiKey: ApiKeyEntity): Promise<void> {
    await this.dynamoDBClient.dataMapper.delete(apiKey);
  }
}
