import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  EnvironmentColor,
  EnvironmentColors,
} from 'src/domain/model/environment/environment-color.model';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnvironmentDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EnvironmentColors)
  color: EnvironmentColor;
}
