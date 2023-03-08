import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ConfigurationAuditEventType } from 'src/domain/model/audit-configuration/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/audit-configuration/configuration-audit-metadata';
import ConfigurationAudit from 'src/domain/model/audit-configuration/configuration-audit.model';

@Entity('configuration-audits')
export default class ConfigurationAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  fromDomain(configurationAudit: ConfigurationAudit): ConfigurationAuditEntity {
    const entity = new ConfigurationAuditEntity();
    entity.id = configurationAudit.id;
    entity.configurationId = configurationAudit.configurationId;
    entity.eventType = configurationAudit.eventType;
    entity.repositoryVcsId = configurationAudit.repositoryVcsId;
    entity.userId = configurationAudit.userId;
    entity.userName = configurationAudit.userName;
    entity.metadata = configurationAudit.metadata;
    return entity;
  }
}
