import { faker } from '@faker-js/faker';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export type MockedGithubRepository = {
  name: string;
  id: number;
  owner: { login: string; id: number; avatar_url: string };
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
};

export type MockedGitlabRepository = {
  name: string;
  id: number;
  namespace: { name: string; path: string; id: number; avatar_url: string };
  permissions: {
    project_access: {
      access_level: number;
      notification_level: number;
    } | null;
    group_access: {
      access_level: number;
      notification_level: number;
    } | null;
  };
};

export class FetchVcsRepositoryMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubRepositoryPresent(
    repositoryVcsId: number,
  ): MockedGithubRepository {
    const data = {
      name: faker.lorem.slug(),
      id: repositoryVcsId,
      owner: {
        login: faker.lorem.slug(),
        id: faker.datatype.number(),
        avatar_url: faker.lorem.slug(),
      },
      permissions: {
        admin: true,
        maintain: true,
        push: true,
        triage: true,
        pull: true,
      },
    };

    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl + `repositories/${repositoryVcsId}`,
      )
      .reply(200, data);

    return data;
  }

  public mockGitlabRepositoryPresent(
    repositoryVcsId: number,
  ): MockedGitlabRepository {
    const data = {
      name: faker.lorem.slug(),
      id: repositoryVcsId,
      namespace: {
        name: faker.lorem.slug(),
        path: faker.lorem.slug(),
        id: faker.datatype.number(),
        avatar_url: faker.lorem.slug(),
      },
      permissions: {
        project_access: {
          access_level: 50,
          notification_level: 3,
        },
        group_access: null,
      },
    };

    this.gitlabClientSpy
      .onGet(config.vcsProvider.gitlab.apiUrl + `projects/${repositoryVcsId}`)
      .reply(200, data);

    return data;
  }

  public mockGithubRepositoryMissing(repositoryVcsId: number): void {
    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl + `repositories/${repositoryVcsId}`,
      )
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }

  public mockGitlabRepositoryMissing(repositoryVcsId: number): void {
    this.gitlabClientSpy
      .onGet(config.vcsProvider.gitlab.apiUrl + `projects/${repositoryVcsId}`)
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }
}
