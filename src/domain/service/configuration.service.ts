import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationFacade from 'src/domain/port/in/configuration.facade.port';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class ConfigurationService implements ConfigurationFacade {
  constructor(
    private readonly configurationStoragePort: ConfigurationStoragePort,
  ) {}

  findById(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration | undefined> {
    return this.configurationStoragePort.findById(vcsType, vcsRepositoryId, id);
  }
  save(configuration: Configuration): Promise<void> {
    return this.configurationStoragePort.save(configuration);
  }
  delete(configuration: Configuration): Promise<void> {
    return this.configurationStoragePort.delete(configuration);
  }
}
