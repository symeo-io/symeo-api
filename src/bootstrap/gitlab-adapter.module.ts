import { Module } from '@nestjs/common';
import { Auth0AdapterModule } from 'src/bootstrap/auth0-adapter.module';
import { GitlabHttpClient } from 'src/infrastructure/gitlab-adapter/gitlab.http.client';
import GitlabAdapter from 'src/infrastructure/gitlab-adapter/adapter/gitlab.adapter';
import VCSAccessTokenStorage from 'src/domain/port/out/vcs-access-token.storage';
import axios, { AxiosInstance } from 'axios';

const GitlabAdapterProvider = {
  provide: 'GitlabAdapter',
  useFactory: (gitlabHttpClient: GitlabHttpClient) =>
    new GitlabAdapter(gitlabHttpClient),
  inject: ['GitlabHttpClient'],
};

const GitlabHttpClientProvider = {
  provide: 'GitlabHttpClient',
  useFactory: (
    vcsAccessTokenStorage: VCSAccessTokenStorage,
    client: AxiosInstance,
  ) => new GitlabHttpClient(vcsAccessTokenStorage, client),
  inject: ['VCSAccessTokenAdapter', 'AxiosInstanceGitlab'],
};

const AxiosInstanceProvider = {
  provide: 'AxiosInstanceGitlab',
  useValue: axios.create(),
};

@Module({
  imports: [Auth0AdapterModule],
  providers: [
    GitlabAdapterProvider,
    GitlabHttpClientProvider,
    AxiosInstanceProvider,
  ],
  exports: [
    GitlabAdapterProvider,
    GitlabHttpClientProvider,
    AxiosInstanceProvider,
  ],
})
export class GitlabAdapterModule {}
