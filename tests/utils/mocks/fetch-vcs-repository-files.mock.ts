import * as fs from 'fs';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryFilesMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubRepositoriesFilesPresent(
    repositoryVcsId: number,
    branch: string,
  ) {
    const mockGitHubBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/github/get_files_for_repository_id.json',
        )
        .toString(),
    );

    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/trees/${branch}?recursive=true`,
      )
      .replyOnce(200, mockGitHubBranchesStub1);

    return mockGitHubBranchesStub1;
  }

  public mockGitlabRepositoriesFilesPresent(
    repositoryVcsId: number,
    branch: string,
  ) {
    const mockGitlabBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/gitlab/get_files_for_repository_id.json',
        )
        .toString(),
    );

    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryVcsId}/repository/tree?ref=${branch}&recursive=true`,
      )
      .replyOnce(200, mockGitlabBranchesStub1);

    return mockGitlabBranchesStub1;
  }
}
