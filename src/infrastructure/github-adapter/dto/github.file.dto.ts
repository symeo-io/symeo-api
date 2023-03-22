import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GithubFileDTO {
  @Expose({ name: 'path' })
  @IsString()
  path: string;
  @Expose({ name: 'url' })
  @IsString()
  url: string;
  @Expose({ name: 'type' })
  @IsString()
  type: 'blob' | 'tree';
}
