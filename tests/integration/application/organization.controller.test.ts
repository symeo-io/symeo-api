import { v4 as uuid } from 'uuid';
import { AppClient } from 'tests/utils/app.client';
import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import path from 'path';

describe('OrganizationController', () => {
  let appClient: AppClient;
  let vcsAccessTokenStorage: VCSAccessTokenStorage;
  let githubClient: Octokit;

  const currentUser = new User(
    uuid(),
    faker.internet.email(),
    VCSProvider.GitHub,
  );

  beforeAll(async () => {
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

  describe('(GET) /organizations', () => {
    it('should respond 200 with github organization', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockGitHubOrganizationsStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/integration/application/stubs/organization/get_organizations_for_user_page_1.json',
          )
          .toString(),
      );
      const mockGitHubOrganizationsResponse1 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: mockGitHubOrganizationsStub1,
      };
      const mockGitHubOrganizationsResponse2 = {
        status: 200 as const,
        headers: {},
        url: '',
        data: [],
      };

      jest
        .spyOn(vcsAccessTokenStorage, 'getGitHubAccessToken')
        .mockImplementation(() => Promise.resolve(mockGitHubToken));
      jest
        .spyOn(githubClient.rest.orgs, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubOrganizationsResponse1),
        );
      jest
        .spyOn(githubClient.rest.orgs, 'listForAuthenticatedUser')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubOrganizationsResponse2),
        );

      return appClient
        .request(currentUser)
        .get(`/organizations`)
        .expect(200)
        .expect({
          organizations: [
            {
              vcsId: 105865802,
              name: 'symeo-io',
              avatarUrl:
                'https://avatars.githubusercontent.com/u/105865802?v=4',
            },
          ],
        });
    });
  });

  describe('(GET) /organizationName/repos', () => {
    it('should respond 200 with github repository', async () => {
      // Given
      const mockGitHubToken = uuid();
      const mockGitHubRepositoriesStub1 = JSON.parse(
        fs
          .readFileSync(
            './tests/integration/application/stubs/organization/get_repositories_for_orga_name_page_1.json',
          )
          .toString(),
      );
      const mockOrganizationName = mockGitHubRepositoriesStub1[0].owner.login;
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
        .spyOn(githubClient.rest.repos, 'listForOrg')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesResponse1),
        );
      jest
        .spyOn(githubClient.rest.repos, 'listForOrg')
        .mockImplementationOnce(() =>
          Promise.resolve(mockGitHubRepositoriesResponse2),
        );

      return appClient
        .request(currentUser)
        .get(`/organizations/${mockOrganizationName}/repos`)
        .expect(200)
        .expect({
          repositories: [
            {
              name: 'Hello-World',
              organization: mockOrganizationName,
              pushedAt: '2011-01-26T19:06:43Z',
              vcsType: VCSProvider.GitHub,
              vcsUrl: 'https://github.com/octocat/Hello-World',
            },
          ],
        });
    });
  });
});
