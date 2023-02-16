export type ConfigurationContractPropertyType =
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean';

export type ConfigurationContractProperty = {
  type: ConfigurationContractPropertyType;
  secret?: boolean;
  optional?: boolean;
};

export class ConfigurationContract {
  [property: string]: ConfigurationContract | ConfigurationContractProperty;
}
