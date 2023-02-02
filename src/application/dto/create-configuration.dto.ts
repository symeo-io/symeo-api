import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';

export class CreateConfigurationDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(VCSProvider)
  vcsType: VCSProvider;

  @IsNotEmpty()
  @IsString()
  repositoryName: string;

  @IsNotEmpty()
  @IsNumber()
  repositoryVcsId: number;

  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @IsNotEmpty()
  @IsNumber()
  ownerVcsId: number;

  @IsNotEmpty()
  @IsString()
  configFormatFilePath: string;

  @IsNotEmpty()
  @IsString()
  branch: string;
}
