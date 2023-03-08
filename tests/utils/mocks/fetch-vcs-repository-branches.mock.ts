import SpyInstance = jest.SpyInstance;
import * as fs from 'fs';
import axios from 'axios';
import { config } from 'symeo-js/config';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryBranchesMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockRepositoriesBranchPresent(vcsRepositoryId: number) {
    const mockGitHubBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/get_branches_for_repository_id_page_1.json',
        )
        .toString(),
    );

    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${vcsRepositoryId}/branches`,
      )
      .replyOnce(200, mockGitHubBranchesStub1)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${vcsRepositoryId}/branches`,
      )
      .replyOnce(200, []);

    return mockGitHubBranchesStub1;
  }
}
