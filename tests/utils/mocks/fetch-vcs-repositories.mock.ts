import { MockedRepository } from 'tests/utils/mocks/fetch-vcs-repository.mock';
import * as fs from 'fs';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoriesMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockRepositoryPresent(): MockedRepository[] {
    const mockGitHubRepositoriesStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/repository/get_repositories_for_orga_name_page_1.json',
        )
        .toString(),
    );

    this.spy
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, mockGitHubRepositoriesStub1)
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, []);

    return mockGitHubRepositoriesStub1;
  }

  mockRepositoryNotPresent() {
    this.spy
      .onGet(config.vcsProvider.github.apiUrl + 'user/repos')
      .replyOnce(200, []);

    return [];
  }
}
