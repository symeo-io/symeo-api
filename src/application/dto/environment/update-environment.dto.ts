import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';

export class UpdateEnvironmentDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EnvironmentColor)
  color: EnvironmentColor;
}
