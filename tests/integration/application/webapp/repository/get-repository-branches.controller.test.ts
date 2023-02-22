import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
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

  describe('(GET) /repository/:vcsRepositoryId/branches', () => {
    it('should respond 200 with github branches', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockRepositoryVcsId = faker.datatype.number();
      const mockGitHubBranchesStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/utils/stubs/repository/get_branches_for_repository_id_page_1.json',
          )
          .toString(),
      );
      const mockGitHubBranchesResponse1 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGitHubBranchesStub1,
      };
      const mockGitHubBranchesResponse2 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [],
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient, 'request')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubBranchesResponse1),
        );
      jest
        .spyOn(githubClient, 'request')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubBranchesResponse2),
        );

      return appClient
        .request(currentUser)
        .get(`/api/v1/repositories/${mockRepositoryVcsId}/branches`)
        .expect(200)
        .expect({
          branches: [
            {
              name: mockGitHubBranchesStub1[0].name,
              commitSha: mockGitHubBranchesStub1[0].commit.sha,
              vcsType: 'github',
            },
            {
              name: mockGitHubBranchesStub1[1].name,
              commitSha: mockGitHubBranchesStub1[1].commit.sha,
              vcsType: 'github',
            },
            {
              name: mockGitHubBranchesStub1[2].name,
              commitSha: mockGitHubBranchesStub1[2].commit.sha,
              vcsType: 'github',
            },
            {
              name: mockGitHubBranchesStub1[3].name,
              commitSha: mockGitHubBranchesStub1[3].commit.sha,
              vcsType: 'github',
            },
            {
              name: mockGitHubBranchesStub1[4].name,
              commitSha: mockGitHubBranchesStub1[4].commit.sha,
              vcsType: 'github',
            },
          ],
        });
    });
  });
});
