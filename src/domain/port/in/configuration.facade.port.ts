import Configuration from 'src/domain/model/configuration.model';

export default interface ConfigurationFacade {
  findById(id: string): Promise<Configuration | undefined>;
  save(configuration: Configuration): Promise<void>;
}
