import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ConfigurationAuditEventType } from 'src/domain/model/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/configuration-audit/configuration-audit-metadata';
import ConfigurationAudit from 'src/domain/model/configuration-audit/configuration-audit.model';
import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';

@Entity('configuration-audits')
export default class ConfigurationAuditEntity extends AbstractEntity {
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
