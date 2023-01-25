import Configuration from 'src/domain/model/configuration.model';

export default interface ConfigurationStoragePort {
  findById(id: string): Promise<Configuration | undefined>;
  save(configuration: Configuration): Promise<void>;
}
