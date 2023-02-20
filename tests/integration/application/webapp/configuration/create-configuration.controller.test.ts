import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
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

  describe('(POST) /configurations', () => {
    it('should return 400 for missing repository id', async () => {
      // Given
      await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github`)
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
        .post(`/api/v1/configurations/github`)
        .send({
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
          repositoryVcsId,
        })
        // Then
        .expect(400);
    });

    it('should not create configuration for non existing config file', async () => {
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
      checkFileExistsOnBranchMock.mockImplementation(() => {
        throw { status: 404 };
      });

      await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github`)
        .send({
          name: faker.name.jobTitle(),
          branch: 'staging',
          contractFilePath: './symeo.config.yml',
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
      checkFileExistsOnBranchMock.mockImplementation(() =>
        Promise.resolve({ status: 200 as const }),
      );

      const sendData = {
        name: faker.name.jobTitle(),
        branch: 'staging',
        contractFilePath: './symeo.config.yml',
        repositoryVcsId,
      };

      const response = await appClient
        .request(currentUser)
        // When
        .post(`/api/v1/configurations/github`)
        .send(sendData)
        // Then
        .expect(201);

      expect(response.body.configuration.id).toBeDefined();
      const configuration: ConfigurationEntity | null =
        await configurationRepository.findOneBy({
          id: response.body.configuration.id,
        });

      expect(configuration).toBeDefined();
      expect(configuration?.name).toEqual(sendData.name);
      expect(configuration?.repositoryVcsId).toEqual(repositoryVcsId);
      expect(configuration?.repositoryVcsName).toEqual(repositoryVcsName);
      expect(configuration?.ownerVcsId).toEqual(ownerVcsId);
      expect(configuration?.ownerVcsName).toEqual(ownerVcsName);
      expect(configuration?.vcsType).toEqual(VCSProvider.GitHub);
      expect(configuration?.contractFilePath).toEqual(
        sendData.contractFilePath,
      );
      expect(configuration?.branch).toEqual(sendData.branch);
      expect(configuration?.environments).toBeDefined();
      expect(configuration?.environments.length).toEqual(2);
    });
  });
});
