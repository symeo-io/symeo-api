import { v4 as uuid } from 'uuid';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;

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
    githubClient = appClient.module.get<Octokit>('Octokit');
  });

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await dynamoDBTestUtils.emptyTable(ConfigurationEntity);
    githubClientRequestMock = jest.spyOn(githubClient, 'request');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientRequestMock.mockRestore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId', () => {
    it('should respond 404 with unknown repository id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration1 = new ConfigurationEntity();
      configuration1.id = uuid();
      configuration1.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration1.rangeKey = configuration1.id;
      configuration1.name = faker.name.jobTitle();

      const configuration2 = new ConfigurationEntity();
      configuration2.id = uuid();
      configuration2.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration2.rangeKey = configuration2.id;
      configuration2.name = faker.name.jobTitle();

      await Promise.all([
        dynamoDBTestUtils.put(configuration1),
        dynamoDBTestUtils.put(configuration2),
      ]);

      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .get(`/configurations/github/${repositoryVcsId}`)
        // Then
        .expect(404);
    });

    it('should respond 200 with known repository and id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration1 = new ConfigurationEntity();
      configuration1.id = uuid();
      configuration1.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration1.rangeKey = configuration1.id;
      configuration1.name = faker.name.jobTitle();

      const configuration2 = new ConfigurationEntity();
      configuration2.id = uuid();
      configuration2.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration2.rangeKey = configuration2.id;
      configuration2.name = faker.name.jobTitle();

      await Promise.all([
        dynamoDBTestUtils.put(configuration1),
        dynamoDBTestUtils.put(configuration2),
      ]);

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          name: 'symeo-api',
          id: repositoryVcsId,
          owner: { login: 'symeo-io', id: 585863519 },
        },
      };
      githubClientRequestMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const response = await appClient
        .request(currentUser)
        .get(`/configurations/github/${repositoryVcsId}`)
        .expect(200);

      expect(response.body.configurations).toBeDefined();
      expect(response.body.configurations.length).toEqual(2);
    });
  });
});
