import { Module } from '@nestjs/common';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import GitlabAdapter from 'src/infrastructure/gitlab-adapter/adapter/gitlab.adapter';
import axios, { AxiosInstance } from 'axios';
import { GitlabAccessTokenSupplier } from '../infrastructure/gitlab-adapter/gitlab-access-token-supplier';
import VCSAccessTokenStoragePort from '../domain/port/out/vcs-access-token.storage.port';
import { Auth0Provider } from '../infrastructure/auth0-adapter/auth0.client';
import { PostgresAdapterModule } from './postgres-adapter.module';
import { Auth0AdapterModule } from './auth0-adapter.module';
import { GitlabAccessTokenHttpClient } from '../infrastructure/gitlab-adapter/gitlab-access-token.http.client';
import { use } from 'passport';

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
    auth0Client: Auth0Provider,
    gitlabAccessTokenHttpClient: GitlabAccessTokenHttpClient,
  ) =>
    new GitlabAccessTokenSupplier(
      vcsAccessTokenStoragePort,
      auth0Client,
      gitlabAccessTokenHttpClient,
    ),
  inject: [
    'PostgresVcsAccessTokenAdapter',
    'Auth0Client',
    'GitlabAccessTokenHttpClient',
  ],
};

const GitlabHttpClientProvider = {
  provide: 'GitlabHttpClient',
  useFactory: (
    gitlabAccessTokenSupplier: GitlabAccessTokenSupplier,
    client: AxiosInstance,
  ) => new GitlabHttpClient(gitlabAccessTokenSupplier, client),
  inject: ['GitlabAccessTokenSupplier', 'AxiosInstanceGitlab'],
};

const GitlabAccessTokenHttpClientProvider = {
  provide: 'GitlabAccessTokenHttpClient',
  useFactory: (client: AxiosInstance) =>
    new GitlabAccessTokenHttpClient(client),
  inject: ['AxiosInstanceGitlab'],
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
    GitlabAccessTokenHttpClientProvider,
    AxiosInstanceProvider,
  ],
  exports: [
    GitlabAdapterProvider,
    GitlabAccessTokenSupplierProvider,
    GitlabHttpClientProvider,
    GitlabAccessTokenHttpClientProvider,
    AxiosInstanceProvider,
  ],
})
export class GitlabAdapterModule {}
