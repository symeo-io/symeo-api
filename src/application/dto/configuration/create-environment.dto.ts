import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EnvironmentColor } from 'src/domain/model/configuration/environment-color.enum';

export class CreateEnvironmentDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EnvironmentColor)
  environmentColor: EnvironmentColor;
}
