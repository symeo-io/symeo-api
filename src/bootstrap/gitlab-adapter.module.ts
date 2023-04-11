import { Module } from '@nestjs/common';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import GitlabAdapter from 'src/infrastructure/gitlab-adapter/adapter/gitlab.adapter';
import axios, { AxiosInstance } from 'axios';
import { GitlabAccessTokenSupplier } from '../infrastructure/gitlab-adapter/gitlab-access-token-supplier';
import VCSAccessTokenStoragePort from '../domain/port/out/vcs-access-token.storage.port';
import { Auth0Client } from '../infrastructure/auth0-adapter/auth0.client';
import { PostgresAdapterModule } from './postgres-adapter.module';
import { Auth0AdapterModule } from './auth0-adapter.module';

const GitlabAdapterProvider = {
  provide: 'GitlabAdapter',
  useFactory: (gitlabHttpClient: GitlabHttpClient) =>
    new GitlabAdapter(gitlabHttpClient),
  inject: ['GitlabHttpClient'],
};

const GitlabAccessTokenSupplierProvider = {
  provide: 'GitlabAccessTokenSupplier',
  useFactory: (
    vcsAccessTokenStoragePort: VCSAccessTokenStoragePort,
    auth0Client: Auth0Client,
    gitlabHttpClient: GitlabHttpClient,
  ) =>
    new GitlabAccessTokenSupplier(
      vcsAccessTokenStoragePort,
      auth0Client,
      gitlabHttpClient,
    ),
  inject: ['PostgresVcsAccessTokenAdapter', 'Auth0Client', 'GitlabHttpClient'],
};

const GitlabHttpClientProvider = {
  provide: 'GitlabHttpClient',
  useFactory: (
    gitlabAccessTokenSupplier: GitlabAccessTokenSupplier,
    client: AxiosInstance,
  ) => new GitlabHttpClient(gitlabAccessTokenSupplier, client),
  inject: ['GitlabAccessTokenSupplier', 'AxiosInstanceGitlab'],
};

const AxiosInstanceProvider = {
  provide: 'AxiosInstanceGitlab',
  useValue: axios.create(),
};

@Module({
  imports: [PostgresAdapterModule, Auth0AdapterModule],
  providers: [
    GitlabAdapterProvider,
    GitlabAccessTokenSupplierProvider,
    GitlabHttpClientProvider,
    AxiosInstanceProvider,
  ],
  exports: [
    GitlabAdapterProvider,
    GitlabAccessTokenSupplierProvider,
    GitlabHttpClientProvider,
    AxiosInstanceProvider,
  ],
})
export class GitlabAdapterModule {}
