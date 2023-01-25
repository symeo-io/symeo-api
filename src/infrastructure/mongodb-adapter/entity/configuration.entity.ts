import Configuration from 'src/domain/model/configuration.model';

export default class ConfigurationEntity {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  public toDomain(): Configuration {
    return new Configuration(this.id);
  }

  static fromDomain(configuration: Configuration): ConfigurationEntity {
    return new ConfigurationEntity(configuration.id);
  }
}
