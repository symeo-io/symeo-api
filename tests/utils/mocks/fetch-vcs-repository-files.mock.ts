import * as fs from 'fs';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryFilesMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockRepositoriesFilesPresent(repositoryVcsId: number, branch: string) {
    const mockGitHubBranchesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/get_files_for_repository_id.json',
        )
        .toString(),
    );

    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/trees/${branch}?recursive=true`,
      )
      .replyOnce(200, mockGitHubBranchesStub1);

    return mockGitHubBranchesStub1;
  }
}
