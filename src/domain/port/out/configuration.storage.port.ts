import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export default interface ConfigurationStoragePort {
  findById(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration | undefined>;

  findAllForRepositoryId(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<Configuration[]>;

  findAllForRepositoryIds(
    vcsType: VCSProvider,
    vcsRepositoryIds: number[],
  ): Promise<Configuration[]>;

  save(configuration: Configuration): Promise<void>;

  delete(configuration: Configuration): Promise<void>;
}
