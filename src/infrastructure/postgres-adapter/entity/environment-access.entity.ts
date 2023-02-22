import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import EnvironmentEntity from 'src/infrastructure/postgres-adapter/entity/environment.entity';
import { EnvironmentAccess } from 'src/domain/model/environment-access/environment-access.model';
import { EnvironmentAccessRole } from 'src/domain/model/environment-access/environment-access-role.enum';

@Entity('environment-accesses')
export default class EnvironmentAccessEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userVcsId: number;

  @Column({
    type: 'enum',
    enum: EnvironmentAccessRole,
    default: EnvironmentAccessRole.READ_NON_SECRET,
  })
  environmentAccessRole: EnvironmentAccessRole;

  @ManyToOne(
    () => EnvironmentEntity,
    (environment) => environment.environmentAccesses,
    { onDelete: 'CASCADE' },
  )
  environment: EnvironmentEntity;

  public toDomain(): EnvironmentAccess {
    return new EnvironmentAccess(
      this.id,
      this.userVcsId,
      this.environmentAccessRole,
    );
  }

  static fromDomain(
    environmentAccess: EnvironmentAccess,
  ): EnvironmentAccessEntity {
    const entity = new EnvironmentAccessEntity();
    entity.id = environmentAccess.id;
    entity.userVcsId = environmentAccess.userVcsId;
    entity.environmentAccessRole = environmentAccess.environmentAccessRole;

    return entity;
  }
}
