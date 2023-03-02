import { Logger, Module } from '@nestjs/common';
import { GithubHttpClient } from '../infrastructure/github-adapter/github.http.client';
import GithubAdapter from '../infrastructure/github-adapter/adapter/github.adapter';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import { Auth0AdapterModule } from 'src/bootstrap/auth0-adapter.module';
import { Octokit } from '@octokit/rest';

const GithubAdapterProvider = {
  provide: 'GithubAdapter',
  useFactory: (githubHttpClient: GithubHttpClient) =>
    new GithubAdapter(githubHttpClient),
  inject: ['GithubHttpClient'],
};

const GithubHttpClientProvider = {
  provide: 'GithubHttpClient',
  useFactory: (vcsAccessTokenStorage: VCSAccessTokenStorage, client: Octokit) =>
    new GithubHttpClient(vcsAccessTokenStorage, client),
  inject: ['VCSAccessTokenAdapter', 'Octokit'],
};

const OctokitProvider = {
  provide: 'Octokit',
  useValue: new Octokit(),
};

@Module({
  imports: [Auth0AdapterModule],
  providers: [GithubAdapterProvider, GithubHttpClientProvider, OctokitProvider],
  exports: [GithubAdapterProvider],
})
export class GithubAdapterModule {}
