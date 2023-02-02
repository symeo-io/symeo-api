import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default interface ConfigurationFacade {
  findById(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration | undefined>;

  findAllForRepositoryId(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<Configuration[]>;
  save(configuration: Configuration): Promise<void>;
  delete(configuration: Configuration): Promise<void>;
}
