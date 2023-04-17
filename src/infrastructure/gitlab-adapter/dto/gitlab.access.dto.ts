import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GitlabAccessDTO {
  @Expose({ name: 'access_level' })
  @IsNumber()
  accessLevel: number;
  @Expose({ name: 'notification_level' })
  @IsNumber()
  notificationLevel: number;
}
