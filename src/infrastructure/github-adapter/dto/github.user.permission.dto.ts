import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class GithubUserPermissionDTO {
  @Expose({ name: 'role_name' })
  @IsString()
  roleName: string;
}
