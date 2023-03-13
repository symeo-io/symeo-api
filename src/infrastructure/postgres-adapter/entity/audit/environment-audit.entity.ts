import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/audit/environment-audit/environment-audit-metadata';
import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';

@Entity('environment-audits')
export default class EnvironmentAuditEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  environmentId: string;

  @Column({
    type: 'enum',
    enum: EnvironmentAuditEventType,
  })
  eventType: EnvironmentAuditEventType;

  @Column()
  repositoryVcsId: number;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({
    type: 'jsonb',
  })
  metadata: EnvironmentAuditMetadata;

  public toDomain(): EnvironmentAudit {
    return new EnvironmentAudit(
      this.environmentId,
      this.eventType,
      this.repositoryVcsId,
      this.userId,
      this.userName,
      this.metadata,
      this.createdAt,
    );
  }

  static fromDomain(
    environmentAudit: EnvironmentAudit,
  ): EnvironmentAuditEntity {
    const entity = new EnvironmentAuditEntity();
    entity.environmentId = environmentAudit.environmentId;
    entity.eventType = environmentAudit.eventType;
    entity.repositoryVcsId = environmentAudit.repositoryVcsId;
    entity.userId = environmentAudit.userId;
    entity.userName = environmentAudit.userName;
    entity.metadata = environmentAudit.metadata;
    entity.createdAt = environmentAudit.createdAt;
    return entity;
  }
}