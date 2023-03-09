import { ConfigurationAuditEventType } from 'src/domain/model/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/configuration-audit/configuration-audit-metadata';

export default class ConfigurationAudit {
  configurationId: string;
  eventType: ConfigurationAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: ConfigurationAuditMetadata;
  createdAt: Date;
  id?: number;

  constructor(
    configurationId: string,
    eventType: ConfigurationAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: ConfigurationAuditMetadata,
    createdAt: Date,
    id?: number,
  ) {
    this.configurationId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.id = id;
  }
}
