import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ValidateCreateGithubConfigurationParametersDTO {
  @IsNotEmpty()
  @IsNumber()
  repositoryVcsId: number;

  @IsNotEmpty()
  @IsString()
  configFormatFilePath: string;

  @IsNotEmpty()
  @IsString()
  branch: string;
}
