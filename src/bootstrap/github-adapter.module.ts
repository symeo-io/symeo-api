import { Module } from '@nestjs/common';
import { Auth0AdapterModule } from 'src/bootstrap/auth0-adapter.module';
import { GithubHttpClient } from '../infrastructure/github-adapter/github.http.client';
import GithubAdapter from '../infrastructure/github-adapter/adapter/github.adapter';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import axios, { AxiosInstance } from 'axios';

const GithubAdapterProvider = {
  provide: 'GithubAdapter',
  useFactory: (githubHttpClient: GithubHttpClient) =>
    new GithubAdapter(githubHttpClient),
  inject: ['GithubHttpClient'],
};

const GithubHttpClientProvider = {
  provide: 'GithubHttpClient',
  useFactory: (
    vcsAccessTokenStorage: VCSAccessTokenStorage,
    client: AxiosInstance,
  ) => new GithubHttpClient(vcsAccessTokenStorage, client),
  inject: ['VCSAccessTokenAdapter', 'AxiosInstanceGithub'],
};

const AxiosInstanceProvider = {
  provide: 'AxiosInstanceGithub',
  useValue: axios.create(),
};

@Module({
  imports: [Auth0AdapterModule],
  providers: [
    GithubAdapterProvider,
    GithubHttpClientProvider,
    AxiosInstanceProvider,
  ],
  exports: [
    GithubAdapterProvider,
    GithubHttpClientProvider,
    AxiosInstanceProvider,
  ],
})
export class GithubAdapterModule {}
