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

  describe('(POST) /configurations', () => {
    it('should return 400 for missing repository id', async () => {
      // Given
      await appClient
        .request(currentUser)
        // When
        .post(`/configurations/github`)
        .send({})
        // Then
        .expect(400);
    });

    it('should not create configuration for non existing repository', async () => {
      // Given
      const repositoryVcsId = 105865802;
      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      await appClient
        .request(currentUser)
        // When
        .post(`/configurations/github`)
        .send({
          name: faker.name.jobTitle(),
          branch: 'staging',
          configFormatFilePath: './symeo.config.yml',
          repositoryVcsId,
        })
        // Then
        .expect(400);
    });

    it('should create a new configuration', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const repositoryVcsName = 'symeo-api';
      const ownerVcsId = 585863519;
      const ownerVcsName = 'symeo-io';
      const mockGitHubRepositoryResponse = {
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
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const sendData = {
        name: faker.name.jobTitle(),
        branch: 'staging',
        configFormatFilePath: './symeo.config.yml',
        repositoryVcsId,
      };

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/configurations/github`)
        .send(sendData)
        // Then
        .expect(201);

      expect(response.body.id).toBeDefined();
      const configuration: ConfigurationEntity = await dynamoDBTestUtils.get(
        ConfigurationEntity,
        {
          hashKey: ConfigurationEntity.buildHashKey(
            VCSProvider.GitHub,
            repositoryVcsId,
          ),
          rangeKey: response.body.id,
        },
      );

      expect(configuration).toBeDefined();
      expect(configuration.name).toEqual(sendData.name);
      expect(configuration.repository.vcsId).toEqual(repositoryVcsId);
      expect(configuration.repository.name).toEqual(repositoryVcsName);
      expect(configuration.owner.vcsId).toEqual(ownerVcsId);
      expect(configuration.owner.name).toEqual(ownerVcsName);
      expect(configuration.vcsType).toEqual(VCSProvider.GitHub);
      expect(configuration.configFormatFilePath).toEqual(
        sendData.configFormatFilePath,
      );
      expect(configuration.branch).toEqual(sendData.branch);
    });
  });
});
