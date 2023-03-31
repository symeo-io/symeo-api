import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabBlobDTO {
  @Expose({ name: 'file_path' })
  @IsString()
  file_path: string;

  @Expose({ name: 'branch' })
  @IsString()
  branch: string;
}
