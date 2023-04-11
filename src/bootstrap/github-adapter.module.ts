import { Module } from '@nestjs/common';
import { GithubHttpClient } from '../infrastructure/github-adapter/github.http.client';
import GithubAdapter from '../infrastructure/github-adapter/adapter/github.adapter';
import axios, { AxiosInstance } from 'axios';
import { GithubAccessTokenSupplier } from '../infrastructure/github-adapter/github-access-token-supplier';
import VCSAccessTokenStoragePort from '../domain/port/out/vcs-access-token.storage.port';
import { Auth0Client } from '../infrastructure/auth0-adapter/auth0.client';
import { InMemoryCacheAdapterModule } from './in-memory-cache-adapter.module';
import { Auth0AdapterModule } from './auth0-adapter.module';

const GithubAdapterProvider = {
  provide: 'GithubAdapter',
  useFactory: (githubHttpClient: GithubHttpClient) =>
    new GithubAdapter(githubHttpClient),
  inject: ['GithubHttpClient'],
};

const GithubAccessTokenSupplierProvider = {
  provide: 'GithubAccessTokenSupplier',
  useFactory: (
    vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    auth0Client: Auth0Client,
  ) => new GithubAccessTokenSupplier(vcsAccessTokenStoragePort, auth0Client),
  inject: ['InMemoryVcsAccessTokenCacheAdapter', 'Auth0Client'],
};

const GithubHttpClientProvider = {
  provide: 'GithubHttpClient',
  useFactory: (
    githubAccessTokenSupplier: GithubAccessTokenSupplier,
    client: AxiosInstance,
  ) => new GithubHttpClient(githubAccessTokenSupplier, client),
  inject: ['GithubAccessTokenSupplier', 'AxiosInstanceGithub'],
};

const AxiosInstanceProvider = {
  provide: 'AxiosInstanceGithub',
  useValue: axios.create(),
};

@Module({
  imports: [InMemoryCacheAdapterModule, Auth0AdapterModule],
  providers: [
    GithubAdapterProvider,
    GithubAccessTokenSupplierProvider,
    GithubHttpClientProvider,
    AxiosInstanceProvider,
  ],
  exports: [
    GithubAdapterProvider,
    GithubAccessTokenSupplierProvider,
    GithubHttpClientProvider,
    AxiosInstanceProvider,
  ],
})
export class GithubAdapterModule {}
