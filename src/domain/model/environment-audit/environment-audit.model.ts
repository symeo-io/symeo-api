import { EnvironmentAuditEventType } from 'src/domain/model/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/environment-audit/environment-audit-metadata';

export default class EnvironmentAudit {
  environmentId: string;
  eventType: EnvironmentAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: EnvironmentAuditMetadata;
  createdAt: Date;
  id?: number;

  constructor(
    configurationId: string,
    eventType: EnvironmentAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: EnvironmentAuditMetadata,
    createdAt: Date,
    id?: number,
  ) {
    this.environmentId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.id = id;
  }
}
