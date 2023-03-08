import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class GithubPermissionsDTO {
  @Expose({ name: 'admin' })
  @IsBoolean()
  admin: boolean;
  @Expose({ name: 'push' })
  @IsBoolean()
  push: boolean;
  @Expose({ name: 'pull' })
  @IsBoolean()
  pull: boolean;
}
