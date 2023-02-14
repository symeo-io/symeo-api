import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  EnvironmentColor,
  EnvironmentColors,
} from 'src/domain/model/environment/environment-color.model';

export class CreateEnvironmentDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EnvironmentColors)
  color: EnvironmentColor;
}
