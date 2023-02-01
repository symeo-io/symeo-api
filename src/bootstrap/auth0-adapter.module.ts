import { Module } from '@nestjs/common';
import { Auth0Client } from 'src/infrastructure/auth0-adapter/auth0.client';
import { VCSAccessTokenAdapter } from 'src/infrastructure/auth0-adapter/adapter/vcs-access-token.adapter';

const VCSAccessTokenAdapterProvider = {
  provide: 'VCSAccessTokenAdapter',
  useFactory: (auth0Client: Auth0Client) =>
    new VCSAccessTokenAdapter(auth0Client),
  inject: ['Auth0Client'],
};

const Auth0ClientProvider = {
  provide: 'Auth0Client',
  useClass: Auth0Client,
};

@Module({
  providers: [VCSAccessTokenAdapterProvider, Auth0ClientProvider],
  exports: [VCSAccessTokenAdapterProvider],
})
export class Auth0AdapterModule {}
