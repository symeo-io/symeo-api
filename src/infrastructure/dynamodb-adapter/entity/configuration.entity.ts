import Configuration from 'src/domain/model/configuration/configuration.model';
import {
  attribute,
  hashKey,
  table,
  rangeKey,
} from '@aws/dynamodb-data-mapper-annotations';
import { config } from 'symeo/config';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import AbstractEntity from 'src/infrastructure/dynamodb-adapter/entity/abstract.entity';

@table(config.database.configuration.tableName)
export default class ConfigurationEntity extends AbstractEntity {
  @hashKey()
  id: string;

  @rangeKey()
  rangeKey: string;

  @attribute()
  name: string;

  @attribute()
  vcsType: VCSProvider;

  @attribute()
  repository: { name: string; vcsId: number };

  @attribute()
  owner: { name: string; vcsId: number };

  @attribute()
  configFormatFilePath: string;

  @attribute()
  branch: string;

  public toDomain(): Configuration {
    return new Configuration(
      this.id,
      this.name,
      this.vcsType,
      this.repository,
      this.owner,
      this.configFormatFilePath,
      this.branch,
    );
  }

  static fromDomain(configuration: Configuration): ConfigurationEntity {
    const entity = new ConfigurationEntity();
    entity.id = configuration.id;
    entity.rangeKey = ConfigurationEntity.buildRangeKey(
      configuration.vcsType,
      configuration.repository.vcsId,
    );

    return entity;
  }

  static buildRangeKey(vcsType: VCSProvider, repositoryVcsId: number) {
    return `${vcsType}|${repositoryVcsId}`;
  }
}
