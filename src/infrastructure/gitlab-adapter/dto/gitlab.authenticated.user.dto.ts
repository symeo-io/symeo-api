import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class GitlabAuthenticatedUserDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'username' })
  @IsString()
  login: string;
  @Expose({ name: 'avatar_url' })
  @IsString()
  avatarUrl: string;
}
