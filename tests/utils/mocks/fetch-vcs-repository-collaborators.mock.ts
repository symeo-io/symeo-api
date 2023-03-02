import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import * as fs from 'fs';

export class FetchVcsRepositoryCollaboratorsMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockCollaboratorsPresent(): void {
    this.spy = jest.spyOn(this.githubClient.rest.repos, 'listCollaborators');

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

    const mockGithubListCollaboratorsResponse1 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub1,
    };

    const mockGithubListCollaboratorsResponse2 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub2,
    };

    const mockGithubListCollaboratorsResponse3 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: mockGithubListCollaboratorsStub3,
    };

    const mockGithubListCollaboratorsResponse4 = {
      status: 200 as const,
      headers: {},
      url: '',
      data: [],
    };

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGithubListCollaboratorsResponse1),
    );

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGithubListCollaboratorsResponse2),
    );

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGithubListCollaboratorsResponse3),
    );

    this.spy.mockImplementationOnce(() =>
      Promise.resolve(mockGithubListCollaboratorsResponse4),
    );
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
