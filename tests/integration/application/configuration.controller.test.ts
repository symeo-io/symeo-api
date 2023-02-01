import { v4 as uuid } from 'uuid';
import { DynamoDbTestUtils } from '../../utils/dynamo-db-test.utils';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
  );

  beforeAll(async () => {
    dynamoDBTestUtils = new DynamoDbTestUtils();
    appClient = new AppClient();

    await appClient.init();

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
  });

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await dynamoDBTestUtils.emptyTable(ConfigurationEntity);
    jest
      .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
      .mockImplementation(() => Promise.resolve(uuid()));
  });

  describe('(GET) /configurations/:id', () => {
    it('should respond 404 with unknown id', () => {
      // Given
      const configurationId = uuid();

      return (
        appClient
          .request(currentUser)
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

      return appClient
        .request(currentUser)
        .get(`/configurations/${configuration.id}`)
        .expect(200);
    });
  });

  describe('(POST) /configurations', () => {
    it('should return 400 for missing repository id', async () => {
      // Given

      await appClient
        .request(currentUser)
        // When
        .post(`/configurations`)
        .send({})
        // Then
        .expect(400);
    });

    it('should create a new configuration', async () => {
      // Given
      const repositoryId = uuid();
      const response = await appClient
        .request(currentUser)
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
