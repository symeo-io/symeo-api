import SpyInstance = jest.SpyInstance;
import { Octokit } from '@octokit/rest';
import { AppClient } from 'tests/utils/app.client';
import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';

export class FetchVcsFileMock {
  public spy: SpyInstance | undefined;
  private readonly githubClient: Octokit;

  constructor(appClient: AppClient) {
    this.githubClient = appClient.module.get<Octokit>('Octokit');
  }

  public mockFilePresent(content?: string): void {
    this.spy = jest.spyOn(this.githubClient.repos, 'getContent');
    this.spy.mockImplementation(() =>
      Promise.resolve({
        status: 200 as const,
        headers: {},
        url: '',
        data: {
          content: content,
          encoding: 'base64',
        },
      }),
    );
  }

  public mockSymeoContractFilePresent(stubPath: string) {
    return this.mockFilePresent(
      base64encode(fs.readFileSync(stubPath).toString()) as string,
    );
  }

  public mockFileMissing(): void {
    this.spy = jest.spyOn(this.githubClient.repos, 'getContent');
    this.spy.mockImplementationOnce(() => {
      throw { status: 404 };
    });
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
