import { faker } from '@faker-js/faker';
import { EnvFileToContractService } from 'src/domain/service/env-file-to-contract.service';

describe('EnvFileToContractService', () => {
  it('should convert env file to contract and values', () => {
    // Given
    const envFile = {
      NODE_ENV: faker.lorem.slug(),
      AWS_PROFILE: faker.lorem.slug(),
      AWS_REGION: faker.lorem.slug(),
      REDIS_DOMAIN_NAME: faker.internet.ip(),
      REDIS_PORT_NUMBER: faker.datatype.number().toString(),
      PLAN_PRICE: faker.datatype.float().toString(),
      LOGGING: faker.datatype.boolean().toString(),
      DYNAMO_URL: faker.internet.url(),
      DYNAMO_BOARDS_TABLE_NAME: faker.lorem.slug(),
      DYNAMO_BOARDS_HISTORY_TABLE_NAME: faker.lorem.slug(),
      DYNAMO_BOARDS_SECONDARY_INDEX: faker.lorem.slug(),
      COGNITO_USER_POOL_ID: faker.datatype.uuid(),
      AVATAR_S3_BUCKET: faker.lorem.slug(),
      CORS_AUTHORIZED_ORIGIN: faker.internet.url(),
      GOOGLE_CLIENT_ID: faker.datatype.uuid(),
      GOOGLE_CLIENT_SECRET: faker.datatype.uuid(),
      EMPTY: '',
    };

    // When
    const contract = EnvFileToContractService.convert(envFile);

    expect(contract).toEqual({
      nodeEnv: { type: 'string' },
      aws: { profile: { type: 'string' }, region: { type: 'string' } },
      redis: {
        domainName: { type: 'string' },
        portNumber: { type: 'integer' },
      },
      planPrice: { type: 'float' },
      logging: { type: 'boolean' },
      dynamo: {
        url: { type: 'string' },
        boards: {
          tableName: { type: 'string' },
          historyTableName: { type: 'string' },
          secondaryIndex: { type: 'string' },
        },
      },
      cognitoUserPoolId: { type: 'string' },
      avatarS3Bucket: { type: 'string' },
      corsAuthorizedOrigin: { type: 'string' },
      google: {
        client: {
          id: { type: 'string' },
          secret: { type: 'string', secret: true },
        },
      },
      empty: { type: 'string' },
    });
  });
});
