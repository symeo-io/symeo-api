import { AppClient } from 'tests/utils/app.client';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import User from 'src/domain/model/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientRequestMock: SpyInstance;
  let checkFileExistsOnBranchMock: SpyInstance;

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
    checkFileExistsOnBranchMock = jest.spyOn(githubClient.repos, 'getContent');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() => Promise.resolve(uuid()));
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    checkFileExistsOnBranchMock.mockRestore();
    githubClientRequestMock.mockRestore();
  });

  describe('(POST) /configurations/github/:vcsRepositoryId/:id/environment', () => {
    it('Should return 400 for missing environmentName', async () => {
      const vcsRepositoryId: string = uuid();
      const configurationId: string = uuid();
      await appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environment`,
        )
        .send({})
        // Then
        .expect(400);
    });

    it('Should return 400 for non existing repository', async () => {
      const vcsRepositoryId: string = uuid();
      const configurationId: string = uuid();
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
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environment`,
        )
        .send(data)
        // Then
        .expect(400);
    });

    it('Should return 200 and create new environment in configuration', async () => {
      const repositoryVcsId: number = faker.datatype.number();
      const repositoryVcsName = 'symeo-api';
      const ownerVcsId = 585863519;
      const ownerVcsName = 'symeo-io';

      const mockGithubRepositoryResponse = {
        status: 200 as number,
        headers: {},
        url: '',
        data: {
          name: repositoryVcsName,
          id: repositoryVcsId,
          owner: { login: ownerVcsName, id: ownerVcsId },
        },
      };
      githubClientRequestMock.mockImplementation(() => {
        Promise.resolve(mockGithubRepositoryResponse);
      });

      const configuration: ConfigurationEntity = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();

      await dynamoDBTestUtils.put(configuration);

      const data = {
        name: faker.name.firstName(),
        color: EnvironmentColor.blue.toString(),
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environment`,
        )
        .send(data)
        // Then
        .expect(200, { name: data.name, color: data.color });
    });
  });
});
