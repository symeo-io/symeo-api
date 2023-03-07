import { faker } from '@faker-js/faker';
import axios, { AxiosInstance } from 'axios';
import { config } from 'symeo-js/config';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export type MockedRepository = {
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

export class FetchVcsRepositoryMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockRepositoryPresent(vcsRepositoryId: number): MockedRepository {
    const data = {
      name: faker.lorem.slug(),
      id: vcsRepositoryId,
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

    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl + `repositories/${vcsRepositoryId}`,
      )
      .reply(200, data);

    return data;
  }

  public mockRepositoryMissing(vcsRepositoryId: number): void {
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl + `repositories/${vcsRepositoryId}`,
      )
      .replyOnce(() => {
        throw { status: 404 };
      });
  }
}
