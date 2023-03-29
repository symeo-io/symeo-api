import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class FetchVcsRepositoryBranchMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMockGithub;
  }

  public mockRepositoriesBranchPresent(
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

    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/branches/${branchName}`,
      )
      .replyOnce(200, mockGitHubBranchStub);

    return mockGitHubBranchStub;
  }
}
