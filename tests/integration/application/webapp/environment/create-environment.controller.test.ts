import { AppClient } from 'tests/utils/app.client';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import User from 'src/domain/model/user/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import SpyInstance = jest.SpyInstance;
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EnvironmentController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
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
    appClient = new AppClient();

    await appClient.init();

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
    configurationRepository = appClient.module.get<
      Repository<ConfigurationEntity>
    >(getRepositoryToken(ConfigurationEntity));
  }, 30000);

  afterAll(async () => {
    await appClient.close();
  });

  beforeEach(async () => {
    await configurationRepository.delete({});
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

  describe('(POST) /configurations/github/:repositoryVcsId/:id/environments', () => {
    it('Should return 400 for missing environment data', async () => {
      const repositoryVcsId: number = faker.datatype.number();
      const configurationId: string = uuid();
      await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments`,
        )
        .send({})
        // Then
        .expect(400);
    });

    it('Should return 404 for non existing repository', async () => {
      const repositoryVcsId = faker.datatype.number();
      const configurationId = uuid();
      githubClientRequestMock.mockImplementation(() => {
        throw { status: 404 };
      });

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments`,
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
      configuration.name = faker.name.jobTitle();
      configuration.vcsType = VCSProvider.GitHub;
      configuration.repositoryVcsId = repositoryVcsId;
      configuration.repositoryVcsName = repositoryVcsName;
      configuration.ownerVcsId = ownerVcsId;
      configuration.ownerVcsName = ownerVcsName;
      configuration.contractFilePath = './symeo.config.yml';
      configuration.branch = 'staging';

      await configurationRepository.save(configuration);

      const data = {
        name: faker.name.firstName(),
        color: 'blue',
      };

      await appClient
        .request(currentUser)
        // When
        .post(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments`,
        )
        .send(data)
        // Then
        .expect(201);

      const configurationEntity: ConfigurationEntity | null =
        await configurationRepository.findOneBy({
          id: configuration.id,
        });
      expect(configurationEntity).toBeDefined();
      expect(configurationEntity?.environments.length).toEqual(1);
      expect(configurationEntity?.environments[0].name).toEqual(data.name);
    });
  });
});
