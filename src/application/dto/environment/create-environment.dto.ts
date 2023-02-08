import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';

export class CreateEnvironmentDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EnvironmentColor)
  color: EnvironmentColor;
}
