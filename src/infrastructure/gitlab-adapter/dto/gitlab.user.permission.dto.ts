import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GitlabUserPermissionDTO {
  @Expose({ name: 'access_level' })
  @IsString()
  accessLevel: number;
}
