import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

class RepositoryEntity {
  name: string;
  vcsId: number;
}

class OwnerEntity {
  name: string;
  vcsId: number;
}

@Entity('configurations')
export default class ConfigurationEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: VCSProvider,
    default: VCSProvider.GitHub,
  })
  vcsType: VCSProvider;

  @Column({
    type: 'jsonb',
  })
  repository: RepositoryEntity;

  @Column({
    type: 'jsonb',
  })
  owner: OwnerEntity;

  @Column()
  configFormatFilePath: string;

  @Column()
  branch: string;

  @OneToMany(
    () => EnvironmentEntity,
    (environment) => environment.configuration,
  )
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
}
