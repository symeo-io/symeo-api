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
import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let dynamoDBTestUtils: DynamoDbTestUtils;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let getGitHubAccessTokenMock: SpyInstance;
  let githubClientGetContentMock: SpyInstance;
  const mockAccessToken = uuid();

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
    githubClientGetContentMock = jest.spyOn(githubClient.repos, 'getContent');
    getGitHubAccessTokenMock = jest.spyOn(
      vcsAccessTokenStorage,
      'getGitHubAccessToken',
    );
    getGitHubAccessTokenMock.mockImplementation(() =>
      Promise.resolve(mockAccessToken),
    );
  });

  afterEach(() => {
    getGitHubAccessTokenMock.mockRestore();
    githubClientGetContentMock.mockRestore();
  });

  describe('(GET) /configurations/github/:repositoryVcsId/:id/format', () => {
    it('should respond 404 with unknown configuration id', () => {
      // Given
      const configurationId = uuid();
      const repositoryVcsId = 105865802;
      const mockConfigurationFormat = base64encode(
        fs
          .readFileSync('./tests/utils/stubs/configuration/symeo.config.yml')
          .toString(),
      );

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          content: mockConfigurationFormat,
          encoding: 'base64',
        },
      };
      githubClientGetContentMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      appClient
        .request(currentUser)
        // When
        .get(
          `/configurations/github/${repositoryVcsId}/${configurationId}/format`,
        )
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown file', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.owner = {
        name: 'symeo-io',
        vcsId: faker.datatype.number(),
      };
      configuration.repository = {
        name: 'symeo-api',
        vcsId: faker.datatype.number(),
      };
      configuration.configFormatFilePath = 'symeo.config.yml';
      configuration.branch = 'staging';

      await dynamoDBTestUtils.put(configuration);

      githubClientGetContentMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .get(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/format`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 with known file and id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        repositoryVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();
      configuration.owner = {
        name: 'symeo-io',
        vcsId: faker.datatype.number(),
      };
      configuration.repository = {
        name: 'symeo-api',
        vcsId: faker.datatype.number(),
      };
      configuration.configFormatFilePath = 'symeo.config.yml';
      configuration.branch = 'staging';

      await dynamoDBTestUtils.put(configuration);

      const mockConfigurationFormat = base64encode(
        fs
          .readFileSync('./tests/utils/stubs/configuration/symeo.config.yml')
          .toString(),
      );

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          content: mockConfigurationFormat,
          encoding: 'base64',
        },
      };
      githubClientGetContentMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const response = await appClient
        .request(currentUser)
        .get(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/format`,
        )
        .expect(200);

      expect(githubClientGetContentMock).toHaveBeenCalled();
      expect(githubClientGetContentMock).toHaveBeenCalledWith({
        owner: configuration.owner.name,
        repo: configuration.repository.name,
        path: configuration.configFormatFilePath,
        ref: configuration.branch,
        headers: { Authorization: `token ${mockAccessToken}` },
      });
      expect(response.body.format).toBeDefined();
      expect(response.body.format.database).toBeDefined();
      expect(response.body.format.database.host).toBeDefined();
      expect(response.body.format.database.host.type).toEqual('string');
      expect(response.body.format.database.password).toBeDefined();
      expect(response.body.format.database.password.type).toEqual('string');
      expect(response.body.format.database.password.secret).toEqual(true);
    });
  });
});
