import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { SecretManagerClient } from 'src/infrastructure/secret-manager-adapter/secret-manager.client';
import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';

export default class SecretManagerAdapter implements SecretValuesStoragePort {
  constructor(private secretManagerClient: SecretManagerClient) {}
  async getValuesForEnvironmentId(
    environmentId: string,
    versionId?: string,
  ): Promise<ConfigurationValues> {
    try {
      const { SecretString } = await this.secretManagerClient.client
        .getSecretValue({
          SecretId: environmentId,
          VersionId: versionId,
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
  async getVersionsForEnvironment(
    environment: Environment,
  ): Promise<ValuesVersion[]> {
    try {
      const valuesVersions: ValuesVersion[] = [];
      const { Versions } = await this.secretManagerClient.client
        .listSecretVersionIds({
          SecretId: environment.id,
          IncludeDeprecated: false,
        })
        .promise();

      if (Versions) {
        Versions.forEach((version) => {
          if (version.VersionId && version.CreatedDate) {
            valuesVersions.push(
              new ValuesVersion(version.VersionId, version.CreatedDate),
            );
          }
        });
      }
      return valuesVersions;
    } catch (error) {
      if ((error as { code: string }).code === 'ResourceNotFoundException') {
        return [];
      }

      throw error;
    }
  }

  async getValuesForEnvironment(
    environment: Environment,
  ): Promise<ConfigurationValues> {
    return this.getValuesForEnvironmentId(environment.id);
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

  async deleteValuesForEnvironment(environment: Environment): Promise<void> {
    const secretExists = await this.secretExistsForEnvironment(environment);

    if (secretExists) {
      await this.secretManagerClient.client
        .deleteSecret({
          SecretId: environment.id,
        })
        .promise();
    }
  }

  private async secretExistsForEnvironment(
    environment: Environment,
  ): Promise<boolean> {
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
