import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let configurationRepository: Repository<ConfigurationEntity>;

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

  describe('(GET) /repositories', () => {
    it('should respond 200 with github repositories', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockGitHubRepositoriesStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/get_repositories_for_orga_name_page_1.json',
          )
          .toString(),
      );
      const mockVcsId = mockGitHubRepositoriesStub1[0].id;
      const mockOrganizationName = mockGitHubRepositoriesStub1[0].owner.login;
      const mockOrganizationId = mockGitHubRepositoriesStub1[0].owner.id;
      const mockOrganizationAvatarUrl =
        mockGitHubRepositoriesStub1[0].owner.avatar_url;
      const mockGitHubRepositoriesResponse1 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGitHubRepositoriesStub1,
      };
      const mockGitHubRepositoriesResponse2 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [],
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient.rest.repos, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesResponse1),
        );
      jest
        .spyOn(githubClient.rest.repos, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesResponse2),
        );

      const configuration = new ConfigurationEntity();
      configuration.id = uuid();
      configuration.name = faker.name.jobTitle();
      configuration.repositoryVcsId = mockVcsId;
      configuration.vcsType = VCSProvider.GitHub;
      configuration.repositoryVcsName = 'symeo-api';
      configuration.ownerVcsId = faker.datatype.number();
      configuration.ownerVcsName = 'symeo-io';
      configuration.contractFilePath = faker.datatype.string();
      configuration.branch = faker.datatype.string();

      await configurationRepository.save(configuration);

      return appClient
        .request(currentUser)
        .get(`/api/v1/repositories`)
        .expect(200)
        .expect({
          repositories: [
            {
              vcsId: mockVcsId,
              name: 'Hello-World',
              owner: {
                name: mockOrganizationName,
                vcsId: mockOrganizationId,
                avatarUrl: mockOrganizationAvatarUrl,
              },
              pushedAt: '2011-01-26T19:06:43.000Z',
              vcsType: VCSProvider.GitHub,
              vcsUrl: 'https://github.com/octocat/Hello-World',
              configurations: [
                {
                  id: configuration.id,
                  name: configuration.name,
                  vcsType: configuration.vcsType,
                  repository: {
                    vcsId: configuration.repositoryVcsId,
                    name: configuration.repositoryVcsName,
                  },
                  owner: {
                    vcsId: configuration.ownerVcsId,
                    name: configuration.ownerVcsName,
                  },
                  contractFilePath: configuration.contractFilePath,
                  branch: configuration.branch,
                  environments: [],
                },
              ],
            },
          ],
        });
    });
  });
});
