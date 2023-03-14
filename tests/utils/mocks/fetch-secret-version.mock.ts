import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import SpyInstance = jest.SpyInstance;
import { AppClient } from 'tests/utils/app.client';

type SecretVersionMockType = {
  CreatedDate: string;
  VersionId: string;
  VersionStages: string[];
};

export class FetchSecretVersionMock {
  public spy: SpyInstance | undefined;
  private readonly secretManagerClient: SecretManagerClient;

  constructor(appClient: AppClient) {
    this.secretManagerClient = appClient.module.get<SecretManagerClient>(
      'SecretManagerClient',
    );
  }

  public mockSecretVersionPresent(secretVersions: SecretVersionMockType[]) {
    this.spy = jest.spyOn(
      this.secretManagerClient.client,
      'listSecretVersionIds',
    );

    const mockGetSecretVersionResponse = {
      Versions: secretVersions,
    };

    this.spy.mockImplementation(() => ({
      promise: () => Promise.resolve(mockGetSecretVersionResponse),
    }));
  }

  public mockSecretVersionMissing() {
    this.spy = jest.spyOn(
      this.secretManagerClient.client,
      'listSecretVersionIds',
    );

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
