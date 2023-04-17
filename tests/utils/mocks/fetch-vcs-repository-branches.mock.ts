import * as fs from 'fs';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryBranchesMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubRepositoriesBranchPresent(repositoryVcsId: number) {
    const mockGitHubBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/github/get_branches_for_repository_id_page_1.json',
        )
        .toString(),
    );

    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/branches`,
      )
      .replyOnce(200, mockGitHubBranchesStub1)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/branches`,
      )
      .replyOnce(200, []);

    return mockGitHubBranchesStub1;
  }

  public mockGitlabRepositoriesBranchPresent(repositoryVcsId: number) {
    const mockGitlabBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/gitlab/get_branches_for_repository_id_page_1.json',
        )
        .toString(),
    );

    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryVcsId}/repository/branches`,
      )
      .replyOnce(200, mockGitlabBranchesStub1)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `projects/${repositoryVcsId}/repository/branches`,
      )
      .replyOnce(200, []);

    return mockGitlabBranchesStub1;
  }
}
