import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/audit/environment-audit/environment-audit-metadata';

export default class EnvironmentAudit {
  environmentId: string;
  eventType: EnvironmentAuditEventType;
  repositoryVcsId: number;
  userId: string;
  userName: string;
  metadata: EnvironmentAuditMetadata;
  createdAt: Date;

  constructor(
    environmentId: string,
    eventType: EnvironmentAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: EnvironmentAuditMetadata,
    createdAt: Date,
  ) {
    this.environmentId = environmentId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}
