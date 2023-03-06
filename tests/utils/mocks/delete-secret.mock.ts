import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';

export class DeleteSecretMock {
  public spy: SpyInstance | undefined;
  private readonly secretManagerClient: SecretManagerClient;

  constructor(appClient: AppClient) {
    this.secretManagerClient = appClient.module.get<SecretManagerClient>(
      'SecretManagerClient',
    );
  }

  public mock() {
    this.spy = jest.spyOn(this.secretManagerClient.client, 'deleteSecret');
    this.spy.mockImplementation(() => ({
      promise: () => Promise.resolve(),
    }));
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
