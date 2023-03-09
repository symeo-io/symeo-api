import { ValuesFacade } from 'src/domain/port/in/values.facade';
import { ConfigurationValues } from 'src/domain/model/configuration/configuration-values.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { SecretValuesStoragePort } from 'src/domain/port/out/secret-values.storage.port';
import Environment from 'src/domain/model/environment/environment.model';
import User from 'src/domain/model/user/user.model';
import Configuration from 'src/domain/model/configuration/configuration.model';
import {
  ConfigurationContract,
  ConfigurationContractProperty,
} from 'src/domain/model/configuration/configuration-contract.model';
import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { EnvironmentPermissionFacade } from 'src/domain/port/in/environment-permission.facade.port';
import { isEmpty, merge } from 'lodash';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private configurationFacade: ConfigurationFacade,
    private environmentPermissionFacade: EnvironmentPermissionFacade,
  ) {}

  async findByEnvironmentForSdk(
    environmentId: string,
  ): Promise<ConfigurationValues> {
    return await this.secretValuesStoragePort.getValuesForEnvironmentId(
      environmentId,
    );
  }

  async getHiddenValuesByEnvironmentForWebapp(
    user: User,
    repository: VcsRepository,
    configuration: Configuration,
    branchName: string | undefined,
    environment: Environment,
  ): Promise<ConfigurationValues> {
    const configurationValues: ConfigurationValues =
      await this.secretValuesStoragePort.getValuesForEnvironmentId(
        environment.id,
      );
    const configurationContract: ConfigurationContract =
      await this.configurationFacade.findContract(
        user,
        configuration,
        branchName,
      );

    const emptyConfigurationValues = new ConfigurationValues();

    return this.parseContractAndValuesToHideSecrets(
      emptyConfigurationValues,
      configurationContract,
      configurationValues,
    );
  }

  private parseContractAndValuesToHideSecrets(
    emptyConfigurationValues: ConfigurationValues,
    configurationContract: ConfigurationContract,
    configurationValues: ConfigurationValues,
  ): ConfigurationValues {
    Object.keys(configurationContract).forEach((propertyName) => {
      const contractProperty = configurationContract[propertyName];
      const valuesProperty = configurationValues[propertyName];

      if (valuesProperty) {
        if (!this.isConfigProperty(contractProperty)) {
          emptyConfigurationValues[propertyName] =
            this.parseContractAndValuesToHideSecrets(
              new ConfigurationValues(),
              contractProperty as ConfigurationContract,
              valuesProperty as ConfigurationValues,
            );
        } else {
          if (this.isContractPropertySecret(contractProperty)) {
            emptyConfigurationValues[propertyName] = this.generateHiddenSecret(
              valuesProperty as string | number | boolean,
            );
          } else {
            emptyConfigurationValues[propertyName] = valuesProperty;
          }
        }
      }
    });

    return emptyConfigurationValues;
  }

  async getNonHiddenValuesByEnvironmentForWebapp(
    environment: Environment,
  ): Promise<ConfigurationValues> {
    return await this.secretValuesStoragePort.getValuesForEnvironmentId(
      environment.id,
    );
  }

  private generateHiddenSecret(valuesProperty: string | number | boolean) {
    return '*'.repeat(valuesProperty.toString().length);
  }

  private isContractPropertySecret(
    contractProperty: ConfigurationContract | ConfigurationContractProperty,
  ) {
    return contractProperty.secret === true;
  }

  private isConfigProperty(
    contractProperty: ConfigurationContract | ConfigurationContractProperty,
  ) {
    return contractProperty.type && typeof contractProperty.type === 'string';
  }

  async updateValuesByEnvironmentForWebapp(
    currentUser: User,
    configuration: Configuration,
    environment: Environment,
    branchName: string | undefined,
    requestedValues: ConfigurationValues,
  ): Promise<void> {
    const persistedValues =
      await this.secretValuesStoragePort.getValuesForEnvironmentId(
        environment.id,
      );

    if (isEmpty(persistedValues)) {
      return await this.secretValuesStoragePort.setValuesForEnvironment(
        environment,
        requestedValues,
      );
    }

    return await this.secretValuesStoragePort.setValuesForEnvironment(
      environment,
      merge(persistedValues, requestedValues),
    );
  }
}
