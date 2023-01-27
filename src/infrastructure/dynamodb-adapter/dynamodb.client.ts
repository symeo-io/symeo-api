import { DataMapper } from '@aws/dynamodb-data-mapper';
import * as AWS from 'aws-sdk';
import { config } from 'symeo/config';

export class DynamoDBClient {
  public dataMapper: DataMapper;

  constructor() {
    this.dataMapper = new DataMapper({
      client: new AWS.DynamoDB({
        endpoint: config.database.dynamodbUrl,
        region: config.aws.region,
      }),
    });
  }
}
