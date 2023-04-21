import { ApiProperty } from '@nestjs/swagger';
import { PlanEnum } from '../../../../domain/model/license/plan.enum';
import License from '../../../../domain/model/license/license.model';

export class LicenseDTO {
  @ApiProperty()
  plan: PlanEnum;
  @ApiProperty()
  licenseKey: string | null;

  constructor(plan: PlanEnum, licenseKey: string | null) {
    this.plan = plan;
    this.licenseKey = licenseKey;
  }

  public static fromDomain(settings: License) {
    return new LicenseDTO(settings.plan, settings.licenseKey);
  }
}
