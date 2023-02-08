import { AppClient } from 'tests/utils/app.client';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import User from 'src/domain/model/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';
import SpyInstance = jest.SpyInstance;

describe('EnvironmentController', () => {
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
    faker.datatype.number(),
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

  describe('(POST) /configurations/github/:vcsRepositoryId/:id/environments', () => {
    it('Should return 400 for missing environment data', async () => {
      const vcsRepositoryId: number = faker.datatype.number();
      const configurationId: string = uuid();
      await appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environments`,
        )
        .send({})
        // Then
        .expect(400);
    });

    it('Should return 404 for non existing repository', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const configurationId = uuid();
      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const data = {
        name: faker.name.firstName(),
        color: EnvironmentColor.blue,
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environments`,
        )
        .send(data)
        // Then
        .expect(404);
    });

    it('Should return 200 and create new environment in configuration', async () => {
      const repositoryVcsId: number = faker.datatype.number();
      const repositoryVcsName = faker.name.firstName();
      const ownerVcsId = faker.datatype.number();
      const ownerVcsName = faker.name.firstName();
      const mockGithubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          name: repositoryVcsName,
          id: repositoryVcsId,
          owner: { login: ownerVcsName, id: ownerVcsId },
        },
      };
      githubClientRequestMock.mockImplementation(() =>
        Promise.resolve(mockGithubRepositoryResponse),
      );

      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.vcsType = VCSProvider.GitHub;
      configuration.repository = {
        vcsId: repositoryVcsId,
        name: repositoryVcsName,
      };
      configuration.owner = {
        vcsId: ownerVcsId,
        name: ownerVcsName,
      };
      configuration.configFormatFilePath = './symeo.config.yml';
      configuration.branch = 'staging';

      await dynamoDBTestUtils.put(configuration);

      const data = {
        name: faker.name.firstName(),
        color: EnvironmentColor.blue,
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(201);

      const configurationEntity: ConfigurationEntity =
        await dynamoDBTestUtils.get(ConfigurationEntity, {
          hashKey: configuration.hashKey,
          rangeKey: configuration.rangeKey,
        });
      expect(configurationEntity).toBeTruthy();
      expect(configurationEntity.environments.length).toEqual(1);
      expect(configurationEntity.environments[0].name).toEqual(data.name);
    });
  });
});
