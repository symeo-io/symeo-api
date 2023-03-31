import Environment from 'src/domain/model/environment/environment.model';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import { ValuesVersion } from 'src/domain/model/values-version/values-version.model';

export interface SecretValuesStoragePort {
  getValuesForEnvironmentId(
    environmentId: string,
    versionId?: string,
  ): Promise<ConfigurationValues>;

  getValuesForEnvironment(
    environment: Environment,
  ): Promise<ConfigurationValues>;

  setValuesForEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void>;

  deleteValuesForEnvironment(environment: Environment): Promise<void>;

  getVersionsForEnvironment(environment: Environment): Promise<ValuesVersion[]>;
}
