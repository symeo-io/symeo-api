import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';

export default interface ConfigurationStoragePort {
  findAllForRepositoryId(
    vcsType: VCSProvider,
    repositoryVcsId: number,
  ): Promise<Configuration[]>;

  findAllForRepositoryIds(
    vcsType: VCSProvider,
    repositoryVcsIds: number[],
  ): Promise<Configuration[]>;

  save(configuration: Configuration): Promise<void>;

  delete(configuration: Configuration): Promise<void>;

  findByIdAndRepositoryVcsId(
    configurationId: string,
    repositoryVcsId: number,
  ): Promise<Configuration | undefined>;
}
