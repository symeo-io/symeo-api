import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GitlabUserPermissionDTO {
  @Expose({ name: 'access_level' })
  @IsNumber()
  accessLevel: number;
}
