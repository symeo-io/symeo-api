import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class GitlabCollaboratorDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'username' })
  @IsString()
  username: string;
  @Expose({ name: 'avatar_url' })
  @IsString()
  avatarUrl: string;
  @Expose({ name: 'access_level' })
  @IsNumber()
  accessLevel: number;
}
