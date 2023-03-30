import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabFileDTO {
  @Expose({ name: 'path' })
  @IsString()
  path: string;
  @Expose({ name: 'type' })
  @IsString()
  type: 'blob' | 'tree';
}
