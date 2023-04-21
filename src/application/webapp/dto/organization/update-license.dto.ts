import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateLicenseDTO {
  @ApiProperty()
  @IsNumber()
  organizationId: number;
  @ApiProperty()
  @IsString()
  licenseKey: string;
}
