import { ConfigurationAuditEventType } from 'src/domain/model/audit-configuration/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/audit-configuration/configuration-audit-metadata';

export default class ConfigurationAudit {
  id: string;
  configurationId: string;
  eventType: ConfigurationAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: ConfigurationAuditMetadata;

  constructor(
    id: string,
    configurationId: string,
    eventType: ConfigurationAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: ConfigurationAuditMetadata,
  ) {
    this.id = id;
    this.configurationId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
  }
}
