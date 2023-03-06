import SpyInstance = jest.SpyInstance;
import { GithubAuthenticatedUserDTO } from 'src/infrastructure/github-adapter/dto/github.authenticated.user.dto';
import axios from 'axios';
import * as fs from 'fs';
import { config } from 'symeo-js/config';

export class FetchAuthenticatedUserMock {
  public spy: SpyInstance | undefined;

  public mockAuthenticatedPresent(): GithubAuthenticatedUserDTO {
    this.spy = jest.spyOn(axios, 'get');
    const mockGitHubAuthenticatedUserStub = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/organization/get_authenticated_user.json',
        )
        .toString(),
    );
    const mockGitHubRepositoriesResponse1 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGitHubAuthenticatedUserStub,
    };

    this.spy.mockImplementationOnce((path: string) => {
      if (path === config.vcsProvider.github.apiUrl + 'user')
        return Promise.resolve(mockGitHubRepositoriesResponse1);
    });

    return mockGitHubAuthenticatedUserStub;
  }
}
