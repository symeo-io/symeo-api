import Configuration from 'src/domain/model/configuration/configuration.model';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  repositoryVcsId: number;

  @Column()
  repositoryVcsName: string;

  @Column()
  ownerVcsId: number;

  @Column()
  ownerVcsName: string;

  @Column()
  contractFilePath: string;

  @Column()
  branch: string;

  @OneToMany(
    () => EnvironmentEntity,
    (environment) => environment.configuration,
    { eager: true, cascade: true },
  )
  environments: EnvironmentEntity[];

  public toDomain(): Configuration {
    return new Configuration(
      this.id,
      this.name,
      this.vcsType,
      { name: this.repositoryVcsName, vcsId: this.repositoryVcsId },
      { name: this.ownerVcsName, vcsId: this.ownerVcsId },
      this.contractFilePath,
      this.branch,
      this.environments?.map((environment) => environment.toDomain()) ?? [],
    );
  }

  static fromDomain(configuration: Configuration): ConfigurationEntity {
    const entity = new ConfigurationEntity();
    entity.id = configuration.id;
    entity.name = configuration.name;
    entity.vcsType = configuration.vcsType;
    entity.repositoryVcsId = configuration.repository.vcsId;
    entity.repositoryVcsName = configuration.repository.name;
    entity.ownerVcsId = configuration.owner.vcsId;
    entity.ownerVcsName = configuration.owner.name;
    entity.contractFilePath = configuration.contractFilePath;
    entity.branch = configuration.branch;
    entity.environments = configuration.environments
      ? configuration.environments.map(EnvironmentEntity.fromDomain)
      : [];

    return entity;
  }
}
