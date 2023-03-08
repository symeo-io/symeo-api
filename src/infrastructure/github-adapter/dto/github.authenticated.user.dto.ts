import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class GithubAuthenticatedUserDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'login' })
  @IsString()
  login: string;
  @Expose({ name: 'avatar_url' })
  @IsString()
  avatarUrl: string;
}
