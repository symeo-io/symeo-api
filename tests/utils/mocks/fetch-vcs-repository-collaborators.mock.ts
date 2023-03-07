import * as fs from 'fs';
import { config } from 'symeo-js/config';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryCollaboratorsMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockCollaboratorsPresent(
    repositoryOwnerName: string,
    repositoryName: string,
  ): void {
    const mockGithubListCollaboratorsStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_1.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub2 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_2.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub3 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/get_environment_permissions_for_owner_and_repo_page_3.json',
        )
        .toString(),
    );

    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub1)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub2)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub3)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repos/${repositoryOwnerName}/${repositoryName}/collaborators`,
      )
      .replyOnce(200, []);
  }
}
