import * as fs from 'fs';
import { base64encode } from 'nodejs-base64';
import { config } from '@symeo-sdk';
import MockAdapter from 'axios-mock-adapter';
import { AppClient } from 'tests/utils/app.client';

export class FetchVcsFileMock {
  public spy: MockAdapter;

  constructor(private appClient: AppClient) {
    this.spy = appClient.axiosMock;
  }

  public mockFilePresent(
    repositoryId: number,
    filePath: string,
    content?: string,
  ): void {
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/contents/${filePath}`,
      )
      .reply(200, {
        content: content ? base64encode(content) : undefined,
        encoding: 'base64',
      });
  }

  public mockSymeoContractFilePresent(
    repositoryId: number,
    contractFilePath: string,
    stubPath: string,
  ) {
    return this.mockFilePresent(
      repositoryId,
      contractFilePath,
      fs.readFileSync(stubPath).toString() as string,
    );
  }

  public mockFileMissing(repositoryId: number, filePath?: string): void {
    this.spy
      .onGet(
        config.vcsProvider.github.apiUrl +
          `repositories/${repositoryId}/contents/${filePath}`,
      )
      .replyOnce(() => {
        throw { response: { status: 404 } };
      });
  }
}
