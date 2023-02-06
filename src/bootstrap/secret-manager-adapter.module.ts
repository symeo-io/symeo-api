import { Module } from '@nestjs/common';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import SecretManagerAdapter from 'src/infrastructure/secret-manager-adapter/adapter/secret-manager.adapter';

const SecretManagerAdapterProvider = {
  provide: 'SecretManagerAdapter',
  useFactory: (secretManagerClient: SecretManagerClient) =>
    new SecretManagerAdapter(secretManagerClient),
  inject: ['SecretManagerClient'],
};

const SecretManagerClientProvider = {
  provide: 'SecretManagerClient',
  useClass: SecretManagerClient,
};

@Module({
  providers: [SecretManagerAdapterProvider, SecretManagerClientProvider],
  exports: [SecretManagerAdapterProvider],
})
export class SecretManagerAdapterModule {}
