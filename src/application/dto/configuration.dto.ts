import Configuration from 'src/domain/model/configuration/configuration.model';

export default class ConfigurationDTO {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  public static fromDomain(configuration: Configuration): ConfigurationDTO {
    return new ConfigurationDTO(configuration.id);
  }
}
