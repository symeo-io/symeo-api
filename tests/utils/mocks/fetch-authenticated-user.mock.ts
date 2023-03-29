import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import * as fs from 'fs';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { GitlabAuthenticatedUserDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.authenticated.user.dto';

export class FetchAuthenticatedUserMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubAuthenticatedPresent(): GithubAuthenticatedUserDTO {
    const mockGitHubAuthenticatedUserStub = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/organization/github/get_authenticated_user.json',
        )
        .toString(),
    );

    this.githubClientSpy
      .onGet(config.vcsProvider.github.apiUrl + 'user')
      .replyOnce(200, mockGitHubAuthenticatedUserStub);

    return mockGitHubAuthenticatedUserStub;
  }

  public mockGitlabAuthenticatedPresent(): GitlabAuthenticatedUserDTO {
    const mockGitlabAuthenticatedUserStub = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/organization/gitlab/get_authenticated_user.json',
        )
        .toString(),
    );

    this.gitlabClientSpy
      .onGet(config.vcsProvider.gitlab.apiUrl + 'user')
      .replyOnce(200, mockGitlabAuthenticatedUserStub);

    return mockGitlabAuthenticatedUserStub;
  }
}
