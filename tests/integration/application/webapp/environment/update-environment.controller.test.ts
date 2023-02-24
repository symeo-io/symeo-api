import { AppClient } from 'tests/utils/app.client';
import { Repository } from 'typeorm';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import User from 'src/domain/model/user/user.model';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import Environment from 'src/domain/model/environment/environment.model';
import { UpdateEnvironmentDTO } from 'src/application/webapp/dto/environment/update-environment.dto';
import SpyInstance = jest.SpyInstance;
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

  describe('(PATCH) /configurations/github/:repositoryVcsId/:configurationId/environments/:environmentId', () => {
    it('Should return 400 for missing environment data', async () => {
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

      const environment = new EnvironmentEntity();
      environment.id = uuid();
      environment.name = faker.datatype.string();
      environment.color = 'blue';

      configuration.environments = [environment];

      await configurationRepository.save(configuration);

      await appClient
        .request(currentUser)
        // When
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${environment.id}`,
        )
        .send({})
        // Then
        .expect(400);
    });

    it('Should return 404 for non existing repository', async () => {
      const repositoryVcsId = faker.datatype.number();
      const configurationId = uuid();
      const environmentId: string = uuid();
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
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/environments/${environmentId}`,
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
      const environmentColor = 'blue';

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
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(environmentId, environmentName, environmentColor),
        ),
      ];

      await configurationRepository.save(configuration);

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        color: 'blueGrey',
      };

      await appClient
        .request(currentUser)
        // When
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${
            configuration.id
          }/environments/${uuid()}`,
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
      const environmentColor = 'blue';

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
      configuration.environments = [
        EnvironmentEntity.fromDomain(
          new Environment(environmentId, environmentName, environmentColor),
        ),
      ];

      await configurationRepository.save(configuration);

      const updatedEnvironmentData: UpdateEnvironmentDTO = {
        name: faker.name.firstName(),
        color: 'blueGrey',
      };
      await appClient
        .request(currentUser)
        // When
        .patch(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/environments/${environmentId}`,
        )
        .send(updatedEnvironmentData)
        // Then
        .expect(200);
      const configurationEntity: ConfigurationEntity | null =
        await configurationRepository.findOneBy({
          id: configuration.id,
        });
      expect(configurationEntity).toBeDefined();
      expect(configurationEntity?.environments[0].id).toEqual(environmentId);
      expect(configurationEntity?.environments[0].name).toEqual(
        updatedEnvironmentData.name,
      );
      expect(configurationEntity?.environments[0].color).toEqual(
        updatedEnvironmentData.color.toString(),
      );
    });
  });
});
