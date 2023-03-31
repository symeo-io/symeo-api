import { ConfigurationAuditDTO } from 'src/application/webapp/dto/audit/configuration-audit.dto';
import ConfigurationAudit from 'src/domain/model/audit/configuration-audit/configuration-audit.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetConfigurationAuditsResponseDTO {
  @ApiProperty({ type: [ConfigurationAuditDTO] })
  configurationAudits: ConfigurationAuditDTO[];

  static fromDomains(configurationAudits: ConfigurationAudit[]) {
    const dto = new GetConfigurationAuditsResponseDTO();
    dto.configurationAudits = configurationAudits.map(
      ConfigurationAuditDTO.fromDomain,
    );
    return dto;
  }
}
