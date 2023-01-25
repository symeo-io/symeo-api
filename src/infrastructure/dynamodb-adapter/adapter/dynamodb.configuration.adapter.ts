import ConfigurationStoragePort from 'src/domain/port/out/configuration.storage.port';
import Configuration from 'src/domain/model/configuration.model';
import ConfigurationRepository from 'src/infrastructure/dynamodb-adapter/repository/configuration.repository';
import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';

export default class DynamodbConfigurationAdapter
  implements ConfigurationStoragePort
{
  constructor(private configurationRepository: ConfigurationRepository) {}
  async findById(id: string): Promise<Configuration | undefined> {
    const entity = await this.configurationRepository.findById(id);

    if (!entity) return undefined;

    return entity.toDomain();
  }

  save(configuration: Configuration): Promise<void> {
    return this.configurationRepository.save(
      ConfigurationEntity.fromDomain(configuration),
    );
  }
}
