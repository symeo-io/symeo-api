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
import { embed } from '@aws/dynamodb-data-mapper';

class RepositoryEntity {
  @attribute()
  name: string;
  @attribute()
  vcsId: number;
}

class OwnerEntity {
  @attribute()
  name: string;
  @attribute()
  vcsId: number;
}

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

  @attribute({ memberType: embed(RepositoryEntity) })
  repository: RepositoryEntity;

  @attribute({ memberType: embed(OwnerEntity) })
  owner: OwnerEntity;

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
    entity.name = configuration.name;
    entity.vcsType = configuration.vcsType;
    entity.repository = configuration.repository;
    entity.owner = configuration.owner;
    entity.configFormatFilePath = configuration.configFormatFilePath;
    entity.branch = configuration.branch;

    return entity;
  }

  static buildRangeKey(vcsType: VCSProvider, repositoryVcsId: number) {
    return `${vcsType}|${repositoryVcsId}`;
  }
}
