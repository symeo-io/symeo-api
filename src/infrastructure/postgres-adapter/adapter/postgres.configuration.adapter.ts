import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { In, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

export default class PostgresConfigurationAdapter
  implements ConfigurationStoragePort
{
  constructor(
    private configurationRepository: Repository<ConfigurationEntity>,
  ) {}
  async findByIdAndRepositoryVcsId(
    configurationId: string,
    repositoryVcsId: number,
  ): Promise<Configuration | undefined> {
    const entity = await this.configurationRepository.findOneBy({
      id: configurationId,
      repositoryVcsId: repositoryVcsId,
    });

    if (!entity) return undefined;

    return entity.toDomain();
  }

  async findAllForRepositoryId(
    vcsType: VCSProvider,
    repositoryVcsId: number,
  ): Promise<Configuration[]> {
    const clock = Date.now();
    Logger.log(
      `Starting to fetch Configurations with vcsType ${vcsType} and repositoryVcsId ${repositoryVcsId}`,
    );
    const entities = await this.configurationRepository.findBy({
      vcsType,
      repositoryVcsId,
    });
    Logger.log(
      `Successfully fetched Configurations with vcsType ${vcsType} and repositoryVcsId ${repositoryVcsId} - Executed in : ${
        (Date.now() - clock) / 1000
      } s`,
    );
    return entities.map((entity) => entity.toDomain());
  }

  async findAllForRepositoryIds(
    vcsType: VCSProvider,
    repositoryVcsIds: number[],
  ): Promise<Configuration[]> {
    const clock = Date.now();
    Logger.log(
      `Starting to fetch Configurations with repositoryVcsIds ${repositoryVcsIds.join(
        ', ',
      )}`,
    );
    const entities = await this.configurationRepository.findBy({
      vcsType,
      repositoryVcsId: In(repositoryVcsIds),
    });

    Logger.log(
      `Successfully fetched Configurations with repositoryVcsIds ${repositoryVcsIds.join(
        ', ',
      )} - Executed in : ${(Date.now() - clock) / 1000} s`,
    );

    return entities.map((entity) => entity.toDomain());
  }

  async save(configuration: Configuration): Promise<void> {
    const clock = Date.now();
    Logger.log(`Starting to save Configuration ${configuration.name} in base`);
    await this.configurationRepository.save(
      ConfigurationEntity.fromDomain(configuration),
    );
    Logger.log(
      `Successfully saved Configuration ${
        configuration.name
      } in base - Executed in : ${(Date.now() - clock) / 1000} s`,
    );
  }

  async delete(configuration: Configuration): Promise<void> {
    await this.configurationRepository.delete({ id: configuration.id });
  }
}
