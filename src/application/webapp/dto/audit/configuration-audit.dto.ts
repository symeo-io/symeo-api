import { ConfigurationAuditEventType } from 'src/domain/model/audit/configuration-audit/configuration-audit-event-type.enum';
import ConfigurationAuditMetadata from 'src/domain/model/audit/configuration-audit/configuration-audit-metadata';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigurationAuditDTO {
  @ApiProperty()
  configurationId: string;
  @ApiProperty({ enum: ConfigurationAuditEventType })
  eventType: ConfigurationAuditEventType;
  @ApiProperty()
  repositoryVcsId: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  userName: string;
  @ApiProperty({ enum: ConfigurationAuditMetadata })
  metadata: ConfigurationAuditMetadata;
  @ApiProperty()
  createdAt: Date;

  constructor(
    configurationId: string,
    eventType: ConfigurationAuditEventType,
    repositoryVcsId: number,
    userId: string,
    userName: string,
    metadata: ConfigurationAuditMetadata,
    createdAt: Date,
  ) {
    this.configurationId = configurationId;
    this.eventType = eventType;
    this.repositoryVcsId = repositoryVcsId;
    this.userId = userId;
    this.userName = userName;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }

  static fromDomain(configurationAudit: ConfigurationAudit) {
    return new ConfigurationAuditDTO(
      configurationAudit.configurationId,
      configurationAudit.eventType,
      configurationAudit.repositoryVcsId,
      configurationAudit.userId,
      configurationAudit.userName,
      configurationAudit.metadata,
      configurationAudit.createdAt,
    );
  }
}
