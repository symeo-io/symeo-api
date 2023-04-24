import { ApiProperty } from '@nestjs/swagger';
import { PlanEnum } from '../../../../domain/model/licence/plan.enum';
import Licence from '../../../../domain/model/licence/licence.model';
import { IsString } from 'class-validator';

export class LicenceDTO {
  @ApiProperty({ enum: PlanEnum })
  plan: PlanEnum;
  @ApiProperty()
  @IsString()
  licenceKey: string | null;

  constructor(plan: PlanEnum, licenceKey: string | null) {
    this.plan = plan;
    this.licenceKey = licenceKey;
  }

  public static fromDomain(settings: Licence) {
    return new LicenceDTO(settings.plan, settings.licenceKey);
  }
}
