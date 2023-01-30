import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ApplicationModule } from 'src/bootstrap/application.module';
import { v4 as uuid } from 'uuid';
import { DynamoDbTestUtils } from '../../utils/dynamo-db-test.utils';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';

describe('ConfigurationController', () => {
  let app: INestApplication;
  let dynamoDBTestUtils: DynamoDbTestUtils;

  beforeAll(async () => {
    dynamoDBTestUtils = new DynamoDbTestUtils();
  });

  beforeEach(async () => {
    await dynamoDBTestUtils.emptyTable(ConfigurationEntity);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('(GET) /configurations/:id', () => {
    it('should respond 404 with unknown id', () => {
      // Given
      const configurationId = uuid();
      return (
        request(app.getHttpServer())
          // When
          .get(`/configurations/${configurationId}`)
          // Then
          .expect(404)
      );
    });

    it('should respond 200 with known id', async () => {
      // Given
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.repositoryId = uuid();

      await dynamoDBTestUtils.put(configuration);

      return request(app.getHttpServer())
        .get(`/configurations/${configuration.id}`)
        .expect(200);
    });
  });

  describe('(POST) /configurations', () => {
    it('should return 400 for missing repository id', async () => {
      // Given

      await request(app.getHttpServer())
        // When
        .post(`/configurations`)
        .send({})
        // Then
        .expect(400);
    });

    it('should create a new configuration', async () => {
      // Given
      const repositoryId = uuid();
      const response = await request(app.getHttpServer())
        // When
        .post(`/configurations`)
        .send({ repositoryId })
        // Then
        .expect(201);

      expect(response.body.id).toBeDefined();
      const configuration = await dynamoDBTestUtils.getById(
        ConfigurationEntity,
        response.body.id,
      );

      expect(configuration).toBeDefined();
      expect(configuration.repositoryId).toEqual(repositoryId);
    });
  });
});
