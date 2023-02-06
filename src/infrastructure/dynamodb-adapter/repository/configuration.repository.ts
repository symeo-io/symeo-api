import ConfigurationEntity from 'src/infrastructure/dynamodb-adapter/entity/configuration.entity';
import { DynamoDBClient } from 'src/infrastructure/dynamodb-adapter/dynamodb.client';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export default class ConfigurationRepository {
  constructor(private readonly dynamoDBClient: DynamoDBClient) {}

  public async findById(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
    id: string,
  ): Promise<ConfigurationEntity | undefined> {
    try {
      return await this.dynamoDBClient.dataMapper.get(
        Object.assign(new ConfigurationEntity(), {
          rangeKey: id,
          hashKey: ConfigurationEntity.buildHashKey(vcsType, vcsRepositoryId),
        }),
      );
    } catch (exception) {
      if ((exception as Error).name !== 'ItemNotFoundException') {
        throw exception;
      }

      return undefined;
    }
  }

  public async findAllForRepositoryId(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<ConfigurationEntity[]> {
    const configurations: ConfigurationEntity[] = [];
    for await (const configuration of this.dynamoDBClient.dataMapper.query(
      ConfigurationEntity,
      {
        hashKey: ConfigurationEntity.buildHashKey(vcsType, vcsRepositoryId),
      },
    )) {
      configurations.push(configuration);
    }

    return configurations;
  }

  public async countForRepositoryId(
    vcsType: VCSProvider,
    vcsRepositoryId: number,
  ): Promise<number> {
    const repositories = await this.findAllForRepositoryId(
      vcsType,
      vcsRepositoryId,
    );

    return repositories.length;
  }

  public async save(configuration: ConfigurationEntity): Promise<void> {
    configuration.updatedAt = new Date();
    await this.dynamoDBClient.dataMapper.put(configuration);
  }

  public async delete(configuration: ConfigurationEntity): Promise<void> {
    await this.dynamoDBClient.dataMapper.delete(configuration);
  }
}
