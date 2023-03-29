import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';
import { faker } from '@faker-js/faker';

export class CreateVcsTreeMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMockGithub;
  }

  public mockCreateRepositoryTree(repositoryVcsId: number) {
    const mockGitHubTreeStub = {
      sha: faker.datatype.uuid(),
      url: faker.internet.url(),
    };

    this.spy
      .onPost(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryVcsId}/git/trees`,
      )
      .replyOnce(200, mockGitHubTreeStub);

    return mockGitHubTreeStub;
  }
}
