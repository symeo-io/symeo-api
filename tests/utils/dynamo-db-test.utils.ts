import { DynamoDBClient } from '../../src/infrastructure/dynamodb-adapter/dynamodb.client';
import { ZeroArgumentsConstructor } from '@aws/dynamodb-data-marshaller';
import { StringToAnyObjectMap } from '@aws/dynamodb-data-mapper/build/constants';

export class DynamoDbTestUtils {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient();
  }

  public async emptyTable<T extends StringToAnyObjectMap>(
    Model: ZeroArgumentsConstructor<T>,
  ) {
    const itemsToDelete = [];
    for await (const item of this.client.dataMapper.scan(Model)) {
      itemsToDelete.push(item);
    }

    const deletedItems = [];
    for await (const item of this.client.dataMapper.batchDelete(
      itemsToDelete,
    )) {
      deletedItems.push(item);
    }

    return deletedItems;
  }

  public async getAll<T extends StringToAnyObjectMap>(
    Model: ZeroArgumentsConstructor<T>,
  ) {
    const items = [];
    for await (const item of this.client.dataMapper.scan(Model)) {
      items.push(item);
    }

    return items;
  }

  public async getById<T extends StringToAnyObjectMap>(
    Model: ZeroArgumentsConstructor<T>,
    id: string,
  ) {
    return this.client.dataMapper.get(Object.assign(new Model(), { id }));
  }

  public async put<T extends StringToAnyObjectMap>(value: T) {
    return this.client.dataMapper.put(value);
  }
}
