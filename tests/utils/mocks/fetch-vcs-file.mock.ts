import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';
import { config } from 'symeo-js';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsFileMock {
  public githubClientSpy: MockAdapter;
  public gitlabClientSpy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.githubClientSpy = appClient.axiosMockGithub;
    this.gitlabClientSpy = appClient.axiosMockGitlab;
  }

  public mockGithubFilePresent(
    repositoryId: number,
    filePath: string,
    content?: string,
  ): void {
    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/contents/${filePath}`,
      )
      .reply(200, {
        content: content ? base64encode(content) : undefined,
        encoding: 'base64',
      });
  }

  public mockGitlabFilePresent(
    repositoryId: number,
    filePath: string,
    content?: string,
  ): void {
    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/repository/files/${filePath}`,
      )
      .reply(200, {
        content: content ? base64encode(content) : undefined,
        encoding: 'base64',
      });
  }

  public mockGithubFileMissing(repositoryId: number, filePath?: string): void {
    this.githubClientSpy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/contents/${filePath}`,
      )
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }

  public mockGitlabFileMissing(repositoryId: number, filePath?: string): void {
    this.gitlabClientSpy
      .onGet(
        config.vcsProvider.gitlab.apiUrl +
          `projects/${repositoryId}/repository/files/${filePath}`,
      )
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }

  public mockSymeoContractFilePresent(
    repositoryId: number,
    contractFilePath: string,
    stubPath: string,
  ) {
    return this.mockGithubFilePresent(
      repositoryId,
      contractFilePath,
      fs.readFileSync(stubPath).toString() as string,
    );
  }
}
