import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { EnvironmentPermission } from 'src/domain/model/environment-permission/environment-permission.model';
import { EnvironmentPermissionRole } from 'src/domain/model/environment-permission/environment-permission-role.enum';

@Entity('environment-permissions')
export default class EnvironmentPermissionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userVcsId: number;

  @Column({
    type: 'enum',
    enum: EnvironmentPermissionRole,
    default: EnvironmentPermissionRole.READ_NON_SECRET,
  })
  environmentPermissionRole: EnvironmentPermissionRole;

  @ManyToOne(
    () => EnvironmentEntity,
    (environment) => environment.environmentPermissions,
    { onDelete: 'CASCADE' },
  )
  environment: EnvironmentEntity;

  public toDomain(): EnvironmentPermission {
    return new EnvironmentPermission(
      this.id,
      this.userVcsId,
      this.environment.toDomain(),
      this.environmentPermissionRole,
    );
  }

  static fromDomain(
    environmentPermission: EnvironmentPermission,
  ): EnvironmentPermissionEntity {
    const entity = new EnvironmentPermissionEntity();
    entity.id = environmentPermission.id;
    entity.userVcsId = environmentPermission.userVcsId;
    entity.environmentPermissionRole =
      environmentPermission.environmentPermissionRole;
    entity.environment = EnvironmentEntity.fromDomain(
      environmentPermission.environment,
    );
    return entity;
  }
}
