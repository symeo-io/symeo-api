import { v4 as uuid } from 'uuid';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import SpyInstance = jest.SpyInstance;
import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ConfigurationController', () => {
  let appClient: AppClient;
  let configurationRepository: Repository<ConfigurationEntity>;
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

  describe('(GET) /configurations/github/:repositoryVcsId/:id/contract', () => {
    it('should respond 404 with unknown configuration id', () => {
      // Given
      const configurationId = uuid();
      const repositoryVcsId = 105865802;
      const mockConfigurationContract = base64encode(
        fs
          .readFileSync('./tests/utils/stubs/configuration/symeo.config.yml')
          .toString(),
      );

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          content: mockConfigurationContract,
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
          `/api/v1/configurations/github/${repositoryVcsId}/${configurationId}/contract`,
        )
        // Then
        .expect(404);
    });

    it('should respond 404 with unknown file', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.name = faker.name.jobTitle();
      configuration.ownerVcsName = 'symeo-io';
      configuration.ownerVcsId = faker.datatype.number();
      configuration.repositoryVcsName = 'symeo-api';
      configuration.repositoryVcsId = repositoryVcsId;
      configuration.contractFilePath = 'symeo.config.yml';
      configuration.branch = 'staging';

      await configurationRepository.save(configuration);

      githubClientGetContentMock.mockImplementation(() => {
        throw { status: 404 };
      });

      appClient
        .request(currentUser)
        // When
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/contract`,
        )
        // Then
        .expect(404);
    });

    it('should respond 200 with known file and id', async () => {
      // Given
      const repositoryVcsId = 105865802;
      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.name = faker.name.jobTitle();
      configuration.ownerVcsName = 'symeo-io';
      configuration.ownerVcsId = faker.datatype.number();
      configuration.repositoryVcsName = 'symeo-api';
      configuration.repositoryVcsId = repositoryVcsId;
      configuration.contractFilePath = 'symeo.config.yml';
      configuration.branch = 'staging';

      await configurationRepository.save(configuration);

      const mockConfigurationContract = base64encode(
        fs
          .readFileSync('./tests/utils/stubs/configuration/symeo.config.yml')
          .toString(),
      );

      const mockGitHubRepositoryResponse = {
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          content: mockConfigurationContract,
          encoding: 'base64',
        },
      };
      githubClientGetContentMock.mockImplementation(() =>
        Promise.resolve(mockGitHubRepositoryResponse),
      );

      const response = await appClient
        .request(currentUser)
        .get(
          `/api/v1/configurations/github/${repositoryVcsId}/${configuration.id}/contract`,
        )
        .expect(200);

      expect(githubClientGetContentMock).toHaveBeenCalled();
      expect(githubClientGetContentMock).toHaveBeenCalledWith({
        owner: configuration.ownerVcsName,
        repo: configuration.repositoryVcsName,
        path: configuration.contractFilePath,
        ref: configuration.branch,
        headers: { Authorization: `token ${mockAccessToken}` },
      });
      expect(response.body.contract).toBeDefined();
      expect(response.body.contract.database).toBeDefined();
      expect(response.body.contract.database.host).toBeDefined();
      expect(response.body.contract.database.host.type).toEqual('string');
      expect(response.body.contract.database.password).toBeDefined();
      expect(response.body.contract.database.password.type).toEqual('string');
      expect(response.body.contract.database.password.secret).toEqual(true);
    });
  });
});
