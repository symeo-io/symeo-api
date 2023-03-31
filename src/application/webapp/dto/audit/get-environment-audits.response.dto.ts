import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentAuditDTO } from 'src/application/webapp/dto/audit/environment-audit.dto';
import EnvironmentAudit from 'src/domain/model/audit/environment-audit/environment-audit.model';

export class GetEnvironmentAuditsResponseDTO {
  @ApiProperty({ type: [EnvironmentAuditDTO] })
  environmentAudits: EnvironmentAuditDTO[];

  static fromDomains(environmentAudits: EnvironmentAudit[]) {
    const dto = new GetEnvironmentAuditsResponseDTO();
    dto.environmentAudits = environmentAudits.map(
      EnvironmentAuditDTO.fromDomain,
    );
    return dto;
  }
}
