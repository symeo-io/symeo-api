import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import ConfigurationEntity from 'src/infrastructure/postgres-adapter/entity/configuration.entity';
import EnvironmentPermissionEntity from 'src/infrastructure/postgres-adapter/entity/environment-permission.entity';

@Entity('environments')
export default class EnvironmentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: EnvironmentColor;

  @Column()
  configurationId: string;

  @ManyToOne(
    () => ConfigurationEntity,
    (configuration) => configuration.environments,
    { onDelete: 'CASCADE' },
  )
  configuration: ConfigurationEntity;

  @OneToMany(
    () => EnvironmentPermissionEntity,
    (environmentPermission) => environmentPermission.environment,
    { cascade: true },
  )
  environmentPermissions: EnvironmentPermissionEntity[];

  public toDomain(): Environment {
    return new Environment(this.id, this.name, this.color, this.createdAt);
  }

  static fromDomain(environment: Environment): EnvironmentEntity {
    const entity = new EnvironmentEntity();
    entity.id = environment.id;
    entity.name = environment.name;
    entity.color = environment.color;
    entity.createdAt = environment.createdAt;

    return entity;
  }
}
