import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { DynamoDbTestUtils } from 'tests/utils/dynamo-db-test.utils';

describe('RepositoryController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;
  let dynamoDBTestUtils: DynamoDbTestUtils;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
    faker.datatype.number(),
  );

  beforeAll(async () => {
    appClient = new AppClient();
    dynamoDBTestUtils = new DynamoDbTestUtils();

    await appClient.init();

    vcsAccessTokenStorage = appClient.module.get<VCSAccessTokenStorage>(
      'VCSAccessTokenAdapter',
    );
    githubClient = appClient.module.get<Octokit>('Octokit');
  });

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
            './tests/integration/application/stubs/organization/get_repositories_for_orga_name_page_1.json',
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
      configuration.hashKey = ConfigurationEntity.buildHashKey(
        VCSProvider.GitHub,
        mockVcsId,
      );
      configuration.rangeKey = configuration.id;
      configuration.name = faker.name.jobTitle();

      await dynamoDBTestUtils.put(configuration);

      return appClient
        .request(currentUser)
        .get(`/repositories`)
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
                },
              ],
            },
          ],
        });
    });
  });
});
