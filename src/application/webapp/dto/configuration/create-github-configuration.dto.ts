import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateGitHubConfigurationDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

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
