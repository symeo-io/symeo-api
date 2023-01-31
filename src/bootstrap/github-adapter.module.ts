import { Module } from '@nestjs/common';
import { GithubHttpClient } from '../infrastructure/github-adapter/github.http.client';
import GithubAdapter from '../infrastructure/github-adapter/adapter/github.adapter';
import { HttpModule, HttpService } from '@nestjs/axios';

const GithubAdapterProvider = {
  provide: 'GithubAdapter',
  useFactory: (githubHttpClient: GithubHttpClient) =>
    new GithubAdapter(githubHttpClient),
  inject: ['GithubHttpClient'],
};

const GithubHttpClientProvider = {
  provide: 'GithubHttpClient',
  useFactory: (httpService: HttpService) => new GithubHttpClient(httpService),
  inject: [HttpService],
};

@Module({
  imports: [HttpModule],
  providers: [GithubAdapterProvider, GithubHttpClientProvider],
  exports: [GithubAdapterProvider, GithubHttpClientProvider],
})
export class GithubAdapterModule {}
