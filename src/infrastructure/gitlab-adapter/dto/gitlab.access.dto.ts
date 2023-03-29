import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GitlabAccessDTO {
  @Expose({ name: 'access_level' })
  @IsNumber()
  access_level: number;
  @Expose({ name: 'notification_level' })
  @IsNumber()
  notification_level: number;
}
