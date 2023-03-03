import { IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class GithubCollaboratorDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'login' })
  @IsString()
  login: string;
  @Expose({ name: 'avatar_url' })
  @IsString()
  avatarUrl: string;
  @Expose({ name: 'role_name' })
  @IsString()
  roleName: string;
}
