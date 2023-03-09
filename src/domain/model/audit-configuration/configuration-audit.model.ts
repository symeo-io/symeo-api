import { ConfigurationAuditEventType } from 'src/domain/model/audit-configuration/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/audit-configuration/configuration-audit-metadata';

export default class ConfigurationAudit {
  id: number;
  configurationId: string;
  eventType: ConfigurationAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: ConfigurationAuditMetadata;
  createdAt: Date;

  constructor(
    id: number,
    configurationId: string,
    eventType: ConfigurationAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: ConfigurationAuditMetadata,
    createdAt: Date,
  ) {
    this.id = id;
    this.configurationId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}
