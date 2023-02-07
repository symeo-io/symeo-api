import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/configuration/environment.model';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';

export default class SecretManagerAdapter implements SecretValuesStoragePort {
  constructor(private secretManagerClient: SecretManagerClient) {}
  async getValuesForEnvironment(
    environment: Environment,
  ): Promise<ConfigurationValues> {
    try {
      const { SecretString } = await this.secretManagerClient.client
        .getSecretValue({
          SecretId: environment.id,
        })
        .promise();

      if (!SecretString) {
        return {};
      }

      return JSON.parse(SecretString) as ConfigurationValues;
    } catch (e) {
      if ((e as { code: string }).code === 'ResourceNotFoundException') {
        return {};
      }

      throw e;
    }
  }
  async setValuesForEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void> {
    const secretExists = await this.secretExistsForEnvironment(environment);

    if (!secretExists) {
      await this.secretManagerClient.client
        .createSecret({
          Name: environment.id,
          SecretString: JSON.stringify(values),
        })
        .promise();

      return;
    }

    await this.secretManagerClient.client
      .putSecretValue({
        SecretId: environment.id,
        SecretString: JSON.stringify(values),
      })
      .promise();
  }

  async secretExistsForEnvironment(environment: Environment): Promise<boolean> {
    try {
      const { SecretString } = await this.secretManagerClient.client
        .getSecretValue({
          SecretId: environment.id,
        })
        .promise();

      return !!SecretString;
    } catch (e) {
      if ((e as { code: string }).code === 'ResourceNotFoundException') {
        return false;
      }

      throw e;
    }
  }
}
