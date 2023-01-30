import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigurationDTO {
  @IsNotEmpty()
  @IsString()
  repositoryId: string;
}
