import SpyInstance = jest.SpyInstance;
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import axios from 'axios';
import * as fs from 'fs';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchAuthenticatedUserMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockAuthenticatedPresent(): GithubAuthenticatedUserDTO {
    const mockGitHubAuthenticatedUserStub = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/organization/get_authenticated_user.json',
        )
        .toString(),
    );

    this.spy
      .onGet(config.vcsProvider.github.apiUrl + 'user')
      .replyOnce(200, mockGitHubAuthenticatedUserStub);

    return mockGitHubAuthenticatedUserStub;
  }
}
