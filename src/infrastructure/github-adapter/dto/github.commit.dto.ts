import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GithubCommitDTO {
  @Expose({ name: 'sha' })
  @IsString()
  sha: string;
  @Expose({ name: 'url' })
  @IsString()
  url: string;
}
