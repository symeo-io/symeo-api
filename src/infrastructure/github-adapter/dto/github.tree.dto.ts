import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GithubTreeDTO {
  @Expose({ name: 'url' })
  @IsString()
  url: string;

  @Expose({ name: 'sha' })
  @IsString()
  sha: string;
}
