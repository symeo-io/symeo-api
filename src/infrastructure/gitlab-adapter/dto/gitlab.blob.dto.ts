import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabBlobDTO {
  @Expose({ name: 'file_path' })
  @IsString()
  filePath: string;

  @Expose({ name: 'branch' })
  @IsString()
  branch: string;
}
