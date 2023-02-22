import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { In, Repository } from 'typeorm';

export default class PostgresConfigurationAdapter
  implements ConfigurationStoragePort
{
  constructor(
    private configurationRepository: Repository<ConfigurationEntity>,
  ) {}
  async findById(
    vcsType: VCSProvider,
    repositoryVcsId: number,
    id: string,
  ): Promise<Configuration | undefined> {
    const entity = await this.configurationRepository.findOneBy({
      id,
      vcsType,
      repositoryVcsId,
    });

    if (!entity) return undefined;

    return entity.toDomain();
  }

  async findAllForRepositoryId(
    vcsType: VCSProvider,
    repositoryVcsId: number,
  ): Promise<Configuration[]> {
    const entities = await this.configurationRepository.findBy({
      vcsType,
      repositoryVcsId,
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findAllForRepositoryIds(
    vcsType: VCSProvider,
    repositoryVcsIds: number[],
  ): Promise<Configuration[]> {
    let start = Date.now();
    console.log(
      'PostgresConfigurationAdapter',
      'findAllForRepositoryIds start',
      '0s',
    );

    const entities = await this.configurationRepository.findBy({
      vcsType,
      repositoryVcsId: In(repositoryVcsIds),
    });
    console.log(
      'PostgresConfigurationAdapter',
      'await this.configurationRepository.findBy',
      `${(Date.now() - start) / 1000}s`,
    );
    start = Date.now();

    const result = entities.map((entity) => entity.toDomain());

    console.log(
      'PostgresConfigurationAdapter',
      'entities.map',
      `${(Date.now() - start) / 1000}s`,
    );

    return result;
  }

  async save(configuration: Configuration): Promise<void> {
    await this.configurationRepository.save(
      ConfigurationEntity.fromDomain(configuration),
    );
  }

  async delete(configuration: Configuration): Promise<void> {
    await this.configurationRepository.delete({ id: configuration.id });
  }
}
