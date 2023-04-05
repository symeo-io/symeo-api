import { Module } from '@nestjs/common';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import { VCSAccessTokenAdapter } from 'src/infrastructure/auth0-adapter/adapter/vcs-access-token.adapter';
import axios, { AxiosInstance } from 'axios';

const VCSAccessTokenAdapterProvider = {
  provide: 'VCSAccessTokenAdapter',
  useFactory: (auth0Client: Auth0Client, axiosClient: AxiosInstance) =>
    new VCSAccessTokenAdapter(auth0Client, axiosClient),
  inject: ['Auth0Client', 'AxiosClient'],
};

const Auth0ClientProvider = {
  provide: 'Auth0Client',
  useClass: Auth0Client,
};

const AxiosClientProvider = {
  provide: 'AxiosClient',
  useValue: axios.create(),
};

@Module({
  providers: [
    VCSAccessTokenAdapterProvider,
    Auth0ClientProvider,
    AxiosClientProvider,
  ],
  exports: [VCSAccessTokenAdapterProvider],
})
export class Auth0AdapterModule {}
