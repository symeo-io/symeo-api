import { EnvironmentAuditEventType } from 'src/domain/model/audit-environment/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/audit-environment/environment-audit-metadata';

export default class EnvironmentAudit {
  id: string;
  environmentId: string;
  eventType: EnvironmentAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: EnvironmentAuditMetadata;

  constructor(
    id: string,
    configurationId: string,
    eventType: EnvironmentAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: EnvironmentAuditMetadata,
  ) {
    this.id = id;
    this.environmentId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
  }
}
