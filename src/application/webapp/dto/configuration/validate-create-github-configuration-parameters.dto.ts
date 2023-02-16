import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ValidateCreateGithubConfigurationParametersDTO {
  @IsNotEmpty()
  @IsNumber()
  repositoryVcsId: number;

  @IsNotEmpty()
  @IsString()
  contractFilePath: string;

  @IsNotEmpty()
  @IsString()
  branch: string;
}
