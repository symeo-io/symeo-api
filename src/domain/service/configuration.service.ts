import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';

export default class ConfigurationService implements ConfigurationFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
  ) {}

  findById(id: string): Promise<Configuration | undefined> {
    return this.configurationStoragePort.findById(id);
  }
  save(configuration: Configuration): Promise<void> {
    return this.configurationStoragePort.save(configuration);
  }
}
