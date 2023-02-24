import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGitHubConfigurationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contractFilePath: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  branch: string;
}
