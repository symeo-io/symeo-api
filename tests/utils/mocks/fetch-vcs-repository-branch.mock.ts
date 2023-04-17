import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class FetchVcsRepositoryBranchMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubRepositoriesBranchPresent(
    repositoryVcsId: number,
    branchName: string,
  ) {
    const mockGitHubBranchStub = {
      name: branchName,
      commit: {
        sha: faker.datatype.uuid(),
        url: faker.internet.url(),
      },
    };

    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/branches/${branchName}`,
      )
      .replyOnce(200, mockGitHubBranchStub);

    return mockGitHubBranchStub;
  }

  public mockGitlabRepositoriesBranchPresent(
    repositoryVcsId: number,
    branchName: string,
  ) {
    const mockGitlabBranchStub = {
      name: branchName,
      commit: {
        sha: faker.datatype.uuid(),
        url: faker.internet.url(),
      },
    };

    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryVcsId}/repository/branches/${branchName}`,
      )
      .replyOnce(200, mockGitlabBranchStub);

    return mockGitlabBranchStub;
  }
}
