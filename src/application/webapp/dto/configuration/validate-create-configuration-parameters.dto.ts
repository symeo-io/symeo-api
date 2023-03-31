import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCreateConfigurationParametersDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  repositoryVcsId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contractFilePath: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  branch: string;
}
