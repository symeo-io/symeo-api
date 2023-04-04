import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class CreateVcsCommitMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubCreateRepositoryCommit(repositoryVcsId: number) {
    const mockGitHubBlobStub = {
      sha: faker.datatype.uuid(),
      url: faker.internet.url(),
    };

    this.githubClientSpy
      .onPost(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/commits`,
      )
      .replyOnce(200, mockGitHubBlobStub);

    return mockGitHubBlobStub;
  }

  public mockGitlabCreateRepositoryCommit(
    repositoryId: number,
    branch: string,
    fileContent: string,
    filePath: string,
  ) {
    const mockGitlabFileStub = {
      file_path: filePath,
      branch: branch,
    };

    this.gitlabClientSpy
      .onPost(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/repository/files/${filePath}`,
      )
      .replyOnce(200, mockGitlabFileStub);

    return mockGitlabFileStub;
  }
}
