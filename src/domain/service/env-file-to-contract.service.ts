import { merge } from 'lodash';
import {
  ConfigurationContract,
  ConfigurationContractPropertyType,
} from 'src/domain/model/configuration/configuration-contract.model';

const INTEGER_REGEX = /^\d*$/;
const FLOAT_REGEX = /^\d+\.\d+$/;

export class EnvFileToContractService {
  public static convert(
    envFile: Record<string, string>,
  ): ConfigurationContract {
    let contract: ConfigurationContract = {};

    for (const propertyName of Object.keys(envFile)) {
      const propertyContract = this.buildEnvPropertyContract(
        propertyName,
        envFile[propertyName],
        Object.keys(envFile).filter((key) => key !== propertyName),
      );

      contract = merge(contract, propertyContract);
    }
    return contract;
  }

  private static buildEnvPropertyContract(
    envPropertyName: string,
    envValue: string,
    adjacentEnvProperties: string[],
  ): ConfigurationContract {
    const splitPropertyName = this.splitPropertyName(envPropertyName);

    if (splitPropertyName.length === 1) {
      return this.buildContractForProperty(envPropertyName, envValue);
    }

    const splitAdjacentPropertyNames = adjacentEnvProperties.map((name) => ({
      propertyName: name,
      split: this.splitPropertyName(name),
    }));
    const firstPropertyNameElement = splitPropertyName[0];
    const siblingProperties = splitAdjacentPropertyNames.filter(
      (elements) => elements.split[0] === firstPropertyNameElement,
    );

    if (siblingProperties.length === 0) {
      return this.buildContractForProperty(envPropertyName, envValue);
    }

    const contract = this.buildEnvPropertyContract(
      envPropertyName.replace(`${firstPropertyNameElement}_`, ''),
      envValue,
      siblingProperties.map((el) =>
        el.propertyName.replace(`${firstPropertyNameElement}_`, ''),
      ),
    );
    return {
      [firstPropertyNameElement.toLowerCase()]: contract,
    };
  }

  private static splitPropertyName(name: string): string[] {
    return name.split('_');
  }

  private static buildContractForProperty(
    envPropertyName: string,
    envValue: string,
  ): ConfigurationContract {
    const splitPropertyName = this.splitPropertyName(envPropertyName);
    const contractPropertyName = this.toCamelCase(splitPropertyName);

    const type = this.inferContractPropertyFromValue(envValue);
    const secret = this.inferIsSecretFromPropertyName(envPropertyName);

    if (secret) {
      return {
        [contractPropertyName]: {
          type,
          secret: true,
        },
      };
    }

    return {
      [contractPropertyName]: {
        type,
      },
    };
  }

  private static toCamelCase(elements: string[]): string {
    let result = '';

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (i === 0) {
        result += element.toLowerCase();
      } else {
        result +=
          element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
      }
    }

    return result;
  }

  private static inferContractPropertyFromValue(
    value: string,
  ): ConfigurationContractPropertyType {
    if (!value) {
      return 'string';
    }

    if (!!value.match(INTEGER_REGEX)) {
      return 'integer';
    }

    if (!!value.match(FLOAT_REGEX)) {
      return 'float';
    }

    if (value === 'true' || value === 'false') {
      return 'boolean';
    }

    return 'string';
  }

  private static inferIsSecretFromPropertyName(
    propertyName: string,
  ): true | undefined {
    if (
      propertyName.toLowerCase().includes('key') ||
      propertyName.toLowerCase().includes('password') ||
      propertyName.toLowerCase().includes('token') ||
      propertyName.toLowerCase().includes('secret')
    ) {
      return true;
    }

    return undefined;
  }
}
