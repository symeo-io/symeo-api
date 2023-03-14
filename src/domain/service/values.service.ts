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
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditFacade from 'src/domain/port/in/environment-audit.facade.port';

export class ValuesService implements ValuesFacade {
  constructor(
    private readonly secretValuesStoragePort: SecretValuesStoragePort,
    private configurationFacade: ConfigurationFacade,
    private environmentPermissionFacade: EnvironmentPermissionFacade,
    private environmentAuditFacade: EnvironmentAuditFacade,
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
      configurationContract,
    );
    await this.environmentAuditFacade.saveWithValuesMetadataType(
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
    values: ConfigurationValues,
  ): Promise<void> {
    const persistedValues =
      await this.secretValuesStoragePort.getValuesForEnvironmentId(
        environment.id,
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

    const updateValuesProperties: string[] = this.getObjectPaths(values);

    await this.environmentAuditFacade.saveWithValuesMetadataType(
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
    configurationContract: ConfigurationContract,
    secretProperties?: string[],
    path?: string,
  ): string[] {
    let result = secretProperties ? [...secretProperties] : [];
    Object.keys(configurationContract).forEach((propertyName) => {
      const contractProperty = configurationContract[propertyName];

      if (!this.isConfigProperty(contractProperty)) {
        result = [
          ...result,
          ...this.parseContractToGetSecretProperties(
            contractProperty as ConfigurationContract,
            secretProperties,
            path ? path + '.' + propertyName : propertyName,
          ),
        ];
      }

      if (
        this.isConfigProperty(contractProperty) &&
        this.isContractPropertySecret(contractProperty)
      ) {
        result.push(path ? path + '.' + propertyName : propertyName);
      }
    });

    return result;
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

  private getObjectPaths(object: any) {
    const paths: string[] = [];
    const walk = function (object: any, path?: string) {
      for (const n in object) {
        if (object[n]) {
          if (typeof object[n] === 'object' || object[n] instanceof Array) {
            walk(object[n], path ? path + '.' + n : n);
          } else {
            paths.push(path ? path + '.' + n : n);
          }
        }
      }
    };
    walk(object);
    return paths;
  }
}
