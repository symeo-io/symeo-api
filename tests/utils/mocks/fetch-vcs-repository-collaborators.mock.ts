import * as fs from 'fs';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsRepositoryCollaboratorsMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubCollaboratorsPresent(repositoryId: number): void {
    const mockGithubListCollaboratorsStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/github/get_environment_permissions_for_owner_and_repo_page_1.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub2 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/github/get_environment_permissions_for_owner_and_repo_page_2.json',
        )
        .toString(),
    );
    const mockGithubListCollaboratorsStub3 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/github/get_environment_permissions_for_owner_and_repo_page_3.json',
        )
        .toString(),
    );

    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub1)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub2)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators`,
      )
      .replyOnce(200, mockGithubListCollaboratorsStub3)
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/collaborators`,
      )
      .replyOnce(200, []);
  }

  public mockGitlabCollaboratorsPresent(repositoryId: number): void {
    const mockGitlabListCollaboratorsStub1 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/gitlab/get_environment_permissions_for_owner_and_repo_page_1.json',
        )
        .toString(),
    );
    const mockGitlabListCollaboratorsStub2 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/gitlab/get_environment_permissions_for_owner_and_repo_page_2.json',
        )
        .toString(),
    );
    const mockGitlabListCollaboratorsStub3 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/gitlab/get_environment_permissions_for_owner_and_repo_page_3.json',
        )
        .toString(),
    );
    const mockGitlabListCollaboratorsStub4 = JSON.parse(
      fs
        .readFileSync(
          './tests/utils/stubs/environment-permission/gitlab/get_environment_permissions_for_owner_and_repo_page_4.json',
        )
        .toString(),
    );

    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/all`,
      )
      .replyOnce(200, mockGitlabListCollaboratorsStub1)
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/all`,
      )
      .replyOnce(200, mockGitlabListCollaboratorsStub2)
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/all`,
      )
      .replyOnce(200, mockGitlabListCollaboratorsStub3)
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/all`,
      )
      .replyOnce(200, mockGitlabListCollaboratorsStub4)
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/members/all`,
      )
      .replyOnce(200, []);
  }
}
