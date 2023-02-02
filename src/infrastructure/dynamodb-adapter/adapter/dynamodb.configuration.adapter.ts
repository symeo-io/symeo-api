import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration/configuration.model';
import ConfigurationRepository from 'src/infrastructure/dynamodb-adapter/repository/configuration.repository';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class DynamodbConfigurationAdapter
  implements ConfigurationStoragePort
{
  constructor(private configurationRepository: ConfigurationRepository) {}
  async findById(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<Configuration | undefined> {
    const entity = await this.configurationRepository.findById(
      vcsType,
      vcsRepositoryId,
      id,
    );

    if (!entity) return undefined;

    return entity.toDomain();
  }

  save(configuration: Configuration): Promise<void> {
    return this.configurationRepository.save(
      ConfigurationEntity.fromDomain(configuration),
    );
  }

  delete(configuration: Configuration): Promise<void> {
    return this.configurationRepository.delete(
      ConfigurationEntity.fromDomain(configuration),
    );
  }
}
