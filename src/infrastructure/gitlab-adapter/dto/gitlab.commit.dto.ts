import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabCommitDTO {
  @Expose({ name: 'id' })
  @IsString()
  id: string;
  @Expose({ name: 'web_url' })
  @IsString()
  web_url: string;
}
