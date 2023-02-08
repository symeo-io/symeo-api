import { DataMapper } from '@aws/dynamodb-data-mapper';
import * as AWS from 'aws-sdk';
import { config } from '@symeo-io/config';

export class DynamoDBClient {
  public dataMapper: DataMapper;

  constructor() {
    this.dataMapper = new DataMapper({
      client: new AWS.DynamoDB({
        credentials:
          config.aws.secretAccessKey && config.aws.accessKeyId
            ? {
                secretAccessKey: config.aws.secretAccessKey,
                accessKeyId: config.aws.accessKeyId,
              }
            : undefined,
        endpoint: config.database.dynamodbUrl,
        region: config.aws.region,
      }),
    });
  }
}
