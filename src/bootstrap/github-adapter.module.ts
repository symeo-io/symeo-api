import { Module } from '@nestjs/common';
import { GithubHttpClient } from '../infrastructure/github-adapter/github.http.client';
import GithubAdapter from '../infrastructure/github-adapter/adapter/github.adapter';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0AdapterModule } from 'src/bootstrap/auth0-adapter.module';

const GithubAdapterProvider = {
  provide: 'GithubAdapter',
  useFactory: (githubHttpClient: GithubHttpClient) =>
    new GithubAdapter(githubHttpClient),
  inject: ['GithubHttpClient'],
};

const GithubHttpClientProvider = {
  provide: 'GithubHttpClient',
  useFactory: (vcsAccessTokenStorage: VCSAccessTokenStorage) =>
    new GithubHttpClient(vcsAccessTokenStorage),
  inject: ['VCSAccessTokenAdapter'],
};

@Module({
  imports: [Auth0AdapterModule],
  providers: [GithubAdapterProvider, GithubHttpClientProvider],
  exports: [GithubAdapterProvider, GithubHttpClientProvider],
})
export class GithubAdapterModule {}
