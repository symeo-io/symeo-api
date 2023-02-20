export type ConfigurationPropertyType =
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean';

export type ConfigurationProperty = {
  type: ConfigurationPropertyType;
  secret?: boolean;
  optional?: boolean;
};

export class ConfigurationFormat {
  [property: string]: ConfigurationFormat | ConfigurationProperty;
}
