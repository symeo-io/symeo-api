import { ApiProperty } from '@nestjs/swagger';
import { PlanEnum } from '../../../../domain/model/license/plan.enum';
import License from '../../../../domain/model/license/license.model';
import { IsString } from 'class-validator';

export class LicenseDTO {
  @ApiProperty({ enum: PlanEnum })
  plan: PlanEnum;
  @ApiProperty()
  @IsString()
  licenseKey: string | null;

  constructor(plan: PlanEnum, licenseKey: string | null) {
    this.plan = plan;
    this.licenseKey = licenseKey;
  }

  public static fromDomain(settings: License) {
    return new LicenseDTO(settings.plan, settings.licenseKey);
  }
}
