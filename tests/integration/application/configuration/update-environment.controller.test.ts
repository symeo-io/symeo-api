import { AppClient } from 'tests/utils/app.client';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import User from 'src/domain/model/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';
import EnvironmentEntity from 'src/infrastructure/dynamodb-adapter/entity/environment.entity';
import Environment from 'src/domain/model/configuration/environment.model';
import { UpdateEnvironmentDTO } from 'src/application/dto/configuration/update-environment.dto';
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

  describe('(PATCH) /configurations/github/:vcsRepositoryId/:id/environment', () => {
    it('Should return 400 for missing environment data', async () => {
      const vcsRepositoryId: number = faker.datatype.number();
      const configurationId: string = uuid();
      const environmentId: string = uuid();
      await appClient
        .request(currentUser)
        // When
        .patch(
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environment/${environmentId}`,
        )
        .send({})
        // Then
        .expect(400);
    });

    it('Should return 404 for non existing repository', async () => {
      const vcsRepositoryId = faker.datatype.number();
      const configurationId = uuid();
      const environmentId: string = uuid();
      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const data = {
        name: faker.name.firstName(),
        environmentColor: EnvironmentColor.blue,
      };

      await appClient
        .request(currentUser)
        // When
        .patch(
          `/configurations/github/${vcsRepositoryId}/${configurationId}/environment/${environmentId}`,
        )
        .send(data)
        // Then
        .expect(404);
    });

    it('Should return 404 for non existing environment', async () => {
      // When
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

      const environmentId = uuid();
      const environmentName = faker.name.firstName();
      const environmentColor = EnvironmentColor.blue;

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
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(environmentId, environmentName, environmentColor),
        ),
      ];

      await dynamoDBTestUtils.put(configuration);

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        environmentColor: EnvironmentColor.blueGrey,
      };

      await appClient
        .request(currentUser)
        // When
        .patch(
          `/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environment/${uuid()}`,
        )
        .send(updatedEnvironmentData)
        // Then
        .expect(404);
    });

    it('Should return 200 and update environment of configuration', async () => {
      // When
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

      const environmentId = uuid();
      const environmentName = faker.name.firstName();
      const environmentColor = EnvironmentColor.blue;

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
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(environmentId, environmentName, environmentColor),
        ),
      ];

      await dynamoDBTestUtils.put(configuration);

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        environmentColor: EnvironmentColor.blueGrey,
      };
      await appClient
        .request(currentUser)
        // When
        .patch(
          `/configurations/github/${repositoryVcsId}/${configuration.id}/environment/${environmentId}`,
        )
        .send(updatedEnvironmentData)
        // Then
        .expect(200);
      const configurationEntities: ConfigurationEntity[] =
        await dynamoDBTestUtils.getAll(ConfigurationEntity);
      expect(configurationEntities.length).toEqual(1);
      expect(configurationEntities[0].environments.length).toEqual(1);
      expect(configurationEntities[0].environments[0].id).toEqual(
        environmentId,
      );
      expect(configurationEntities[0].environments[0].name).toEqual(
        updatedEnvironmentData.name,
      );
      expect(configurationEntities[0].environments[0].color).toEqual(
        updatedEnvironmentData.environmentColor.toString(),
      );
    });
  });
});
