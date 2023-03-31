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
  avatar_url: string;
  @Expose({ name: 'access_level' })
  @IsNumber()
  access_level: number;
}
