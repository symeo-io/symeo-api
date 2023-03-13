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
import EnvironmentAuditService from 'src/domain/service/environment-audit.service';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private configurationFacade: ConfigurationFacade,
    private environmentPermissionFacade: EnvironmentPermissionFacade,
    private environmentAuditService: EnvironmentAuditService,
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

  async getNonHiddenValuesByEnvironmentForWebapp(
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

    const secretProperties: string[] = this.parseContractToGetSecretProperties(
      [],
      configurationContract,
    );
    await this.environmentAuditService.saveWithValuesMetadataType(
      EnvironmentAuditEventType.SECRETS_READ,
      user,
      repository,
      environment,
      { environmentName: environment.name, readProperties: secretProperties },
    );

    return configurationValues;
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

  async updateValuesByEnvironmentForWebapp(
    currentUser: User,
    repository: VcsRepository,
    configuration: Configuration,
    environment: Environment,
    branch: string | undefined,
    values: ConfigurationValues,
  ): Promise<void> {
    const persistedValues =
      await this.secretValuesStoragePort.getValuesForEnvironmentId(
        environment.id,
      );

    const configurationContract: ConfigurationContract =
      await this.configurationFacade.findContract(
        currentUser,
        configuration,
        branch,
      );

    if (isEmpty(persistedValues)) {
      await this.secretValuesStoragePort.setValuesForEnvironment(
        environment,
        values,
      );
    } else {
      await this.secretValuesStoragePort.setValuesForEnvironment(
        environment,
        merge(persistedValues, values),
      );
    }

    const updateValuesProperties: string[] =
      this.parseContractAndValuesToGetUpdatedProperties(
        [],
        configurationContract,
        values,
      );

    await this.environmentAuditService.saveWithValuesMetadataType(
      EnvironmentAuditEventType.VALUES_UPDATED,
      currentUser,
      repository,
      environment,
      {
        environmentName: environment.name,
        updatedProperties: updateValuesProperties,
      },
    );
  }

  private parseContractToGetSecretProperties(
    secretProperties: string[],
    configurationContract: ConfigurationContract,
  ): string[] {
    Object.keys(configurationContract).forEach((propertyName) => {
      const contractProperty = configurationContract[propertyName];

      if (!this.isConfigProperty(contractProperty)) {
        this.parseContractToGetSecretProperties(
          secretProperties,
          contractProperty as ConfigurationContract,
        );
      }

      if (
        this.isConfigProperty(contractProperty) &&
        this.isContractPropertySecret(contractProperty)
      ) {
        secretProperties.push(propertyName);
      }
    });

    return secretProperties;
  }

  private parseContractAndValuesToGetUpdatedProperties(
    valuesProperties: string[],
    configurationContract: ConfigurationContract,
    updatedValues: ConfigurationValues,
  ) {
    Object.keys(configurationContract).forEach((propertyName) => {
      const contractProperty = configurationContract[propertyName];
      const valuesProperty = updatedValues[propertyName];

      if (!this.isConfigProperty(contractProperty)) {
        this.parseContractAndValuesToGetUpdatedProperties(
          valuesProperties,
          contractProperty as ConfigurationContract,
          valuesProperty as ConfigurationValues,
        );
      }

      if (this.isConfigProperty(contractProperty) && !!valuesProperty) {
        valuesProperties.push(propertyName);
      }
    });

    return valuesProperties;
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
}
