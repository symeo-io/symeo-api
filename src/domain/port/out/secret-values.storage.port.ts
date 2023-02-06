import Environment from 'src/domain/model/configuration/environment.model';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';

export interface SecretValuesStoragePort {
  getValuesForEnvironment(
    environment: Environment,
  ): Promise<ConfigurationValues>;

  setValuesForEnvironment(
    environment: Environment,
    values: ConfigurationValues,
  ): Promise<void>;
}
