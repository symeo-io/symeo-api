import { v4 as uuid } from 'uuid';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';

@Entity('sdk-values-read', { schema: 'analytics' })
export default class SdkValuesReadAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  environmentId: string;

  @Column()
  configurationId: string;

  @Column()
  vcsType: VCSProvider;

  @Column()
  repositoryVcsId: number;

  @Column()
  repositoryVcsName: string;

  @Column()
  repositoryOwnerVcsId: number;

  @Column()
  repositoryOwnerVcsName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  static fromEnvironmentEntity(
    environment: EnvironmentEntity,
    configuration: ConfigurationEntity,
  ): SdkValuesReadAnalyticsEntity {
    const entity = new SdkValuesReadAnalyticsEntity();
    entity.id = uuid();
    entity.environmentId = environment.id;
    entity.configurationId = configuration.id;
    entity.vcsType = configuration.vcsType;
    entity.repositoryVcsId = configuration.repositoryVcsId;
    entity.repositoryVcsName = configuration.repositoryVcsName;
    entity.repositoryOwnerVcsId = configuration.ownerVcsId;
    entity.repositoryOwnerVcsName = configuration.ownerVcsName;
    entity.createdAt = new Date();

    return entity;
  }
}
