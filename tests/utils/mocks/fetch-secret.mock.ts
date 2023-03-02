import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';

export class FetchSecretMock {
  public spy: SpyInstance | undefined;
  private readonly secretManagerClient: SecretManagerClient;

  constructor(appClient: AppClient) {
    this.secretManagerClient = appClient.module.get<SecretManagerClient>(
      'SecretManagerClient',
    );
  }

  public mockSecretPresent(secret: any) {
    this.spy = jest.spyOn(this.secretManagerClient.client, 'getSecretValue');

    const mockGetSecretResponse = {
      SecretString: JSON.stringify(secret),
    };

    this.spy.mockImplementation(() => ({
      promise: () => Promise.resolve(mockGetSecretResponse),
    }));
  }

  public mockSecretMissing() {
    this.spy = jest.spyOn(this.secretManagerClient.client, 'getSecretValue');

    this.spy.mockImplementation(() => ({
      promise: () => {
        throw { code: 'ResourceNotFoundException' };
      },
    }));
  }

  public restore(): void {
    this.spy?.mockRestore();
    this.spy = undefined;
  }
}
