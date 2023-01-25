import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';

export default class ConfigurationRepository {
  private storage: ConfigurationEntity[] = [];

  public async findById(id: string): Promise<ConfigurationEntity | undefined> {
    return this.storage.find((configuration) => configuration.id === id);
  }

  public async save(configuration: ConfigurationEntity): Promise<void> {
    this.storage.push(configuration);
  }
}
