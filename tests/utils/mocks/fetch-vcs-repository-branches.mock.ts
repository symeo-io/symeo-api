import * as fs from 'fs';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryBranchesMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockRepositoriesBranchPresent(repositoryVcsId: number) {
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
}
