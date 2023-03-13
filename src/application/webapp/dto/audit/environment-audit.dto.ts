import { EnvironmentAuditEventType } from 'src/domain/model/audit/environment-audit/environment-audit-event-type.enum';
import EnvironmentAuditMetadata from 'src/domain/model/audit/environment-audit/environment-audit-metadata';
import { ApiProperty } from '@nestjs/swagger';
import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';

export class EnvironmentAuditDTO {
  @ApiProperty()
  environmentId: string;
  @ApiProperty({ enum: EnvironmentAuditEventType })
  eventType: EnvironmentAuditEventType;
  @ApiProperty()
  repositoryVcsId: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  userName: string;
  @ApiProperty({ type: EnvironmentAuditMetadata })
  metadata: EnvironmentAuditMetadata;
  @ApiProperty()
  createdAt: string;

  constructor(
    environmentId: string,
    eventType: EnvironmentAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: EnvironmentAuditMetadata,
    createdAt: string,
  ) {
    this.environmentId = environmentId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  static fromDomain(environmentAudit: EnvironmentAudit): EnvironmentAuditDTO {
    return new EnvironmentAuditDTO(
      environmentAudit.environmentId,
      environmentAudit.eventType,
      environmentAudit.repositoryVcsId,
      environmentAudit.userId,
      environmentAudit.userName,
      environmentAudit.metadata,
      environmentAudit.createdAt.toISOString(),
    );
  }
}
