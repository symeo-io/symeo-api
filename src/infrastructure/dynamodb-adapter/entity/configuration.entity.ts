import Configuration from 'src/domain/model/configuration/configuration.model';
import {
  attribute,
  hashKey,
  table,
  rangeKey,
} from '@aws/dynamodb-data-mapper-annotations';
import { config } from '@symeo-io/symeo/config';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import AbstractEntity from 'src/infrastructure/dynamodb-adapter/entity/abstract.entity';
import { embed } from '@aws/dynamodb-data-mapper';
import EnvironmentEntity from 'src/infrastructure/dynamodb-adapter/entity/environment.entity';

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
  hashKey: string;

  @rangeKey()
  rangeKey: string;

  @attribute()
  id: string;

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

  @attribute({ memberType: embed(EnvironmentEntity) })
  environments: EnvironmentEntity[];

  public toDomain(): Configuration {
    return new Configuration(
      this.id,
      this.name,
      this.vcsType,
      this.repository,
      this.owner,
      this.configFormatFilePath,
      this.branch,
      this.environments?.map((environment) => environment.toDomain()) ?? [],
    );
  }

  static fromDomain(configuration: Configuration): ConfigurationEntity {
    const entity = new ConfigurationEntity();
    entity.hashKey = ConfigurationEntity.buildHashKey(
      configuration.vcsType,
      configuration.repository.vcsId,
    );
    entity.rangeKey = configuration.id;
    entity.id = configuration.id;
    entity.name = configuration.name;
    entity.vcsType = configuration.vcsType;
    entity.repository = configuration.repository;
    entity.owner = configuration.owner;
    entity.configFormatFilePath = configuration.configFormatFilePath;
    entity.branch = configuration.branch;
    entity.environments = configuration.environments
      ? configuration.environments.map(EnvironmentEntity.fromDomain)
      : [];

    return entity;
  }

  static buildHashKey(vcsType: VCSProvider, repositoryVcsId: number) {
    return `${vcsType}|${repositoryVcsId}`;
  }
}
