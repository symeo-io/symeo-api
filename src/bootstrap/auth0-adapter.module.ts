import { Module } from '@nestjs/common';
import { Auth0Provider } from '../infrastructure/auth0-adapter/auth0.client';

const Auth0ClientProvider = {
  provide: 'Auth0Client',
  useClass: Auth0Provider,
};

@Module({
  providers: [Auth0ClientProvider],
  exports: [Auth0ClientProvider],
})
export class Auth0AdapterModule {}
