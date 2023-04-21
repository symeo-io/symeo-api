import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateLicenceDTO {
  @ApiProperty()
  @IsNumber()
  organizationId: number;
  @ApiProperty()
  @IsString()
  licenceKey: string;
}
