import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabCommitDTO {
  @Expose({ name: 'id' })
  @IsString()
  sha: string;
  @Expose({ name: 'web_url' })
  @IsString()
  url: string;
}
