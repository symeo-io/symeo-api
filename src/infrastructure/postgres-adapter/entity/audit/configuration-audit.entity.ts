import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/audit/configuration-audit/configuration-audit-metadata';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';

@Entity('configuration-audits')
export default class ConfigurationAuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  configurationId: string;

  @Column({
    type: 'enum',
    enum: ConfigurationAuditEventType,
  })
  eventType: ConfigurationAuditEventType;

  @Column()
  repositoryVcsId: number;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({
    type: 'jsonb',
  })
  metadata: ConfigurationAuditMetadata;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  public toDomain(): ConfigurationAudit {
    return new ConfigurationAudit(
      this.configurationId,
      this.eventType,
      this.repositoryVcsId,
      this.userId,
      this.userName,
      this.metadata,
      this.createdAt,
    );
  }

  static fromDomain(
    configurationAudit: ConfigurationAudit,
  ): ConfigurationAuditEntity {
    const entity = new ConfigurationAuditEntity();
    entity.configurationId = configurationAudit.configurationId;
    entity.eventType = configurationAudit.eventType;
    entity.repositoryVcsId = configurationAudit.repositoryVcsId;
    entity.userId = configurationAudit.userId;
    entity.userName = configurationAudit.userName;
    entity.metadata = configurationAudit.metadata;
    entity.createdAt = configurationAudit.createdAt;
    return entity;
  }
}
