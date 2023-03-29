import {
  MockedGithubRepository,
  MockedGitlabRepository,
} from 'tests/utils/mocks/fetch-vcs-repository.mock';
import * as fs from 'fs';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoriesMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubRepositoryPresent(): MockedGithubRepository[] {
    const mockGitHubRepositoriesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/github/get_repositories_for_orga_name_page_1.json',
        )
        .toString(),
    );

    this.githubClientSpy
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, mockGitHubRepositoriesStub1)
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, []);

    return mockGitHubRepositoriesStub1;
  }

  public mockGitlabRepositoryPresent(): MockedGitlabRepository[] {
    const mockGitlabRepositoriesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/gitlab/get_repositories_for_user_page_1.json',
        )
        .toString(),
    );

    this.gitlabClientSpy
      .onGet(config.vcsProvider.gitlab.apiUrl + 'projects?membership=true')
      .replyOnce(200, mockGitlabRepositoriesStub1)
      .onGet(config.vcsProvider.gitlab.apiUrl + 'projects?membership=true')
      .replyOnce(200, []);

    return mockGitlabRepositoriesStub1;
  }

  mockGithubRepositoryNotPresent() {
    this.githubClientSpy
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, []);
    return [];
  }

  mockGitlabRepositoryNotPresent() {
    this.gitlabClientSpy
      .onGet(config.vcsProvider.gitlab.apiUrl + 'projects?membership=true')
      .replyOnce(200, []);
    return [];
  }
}
