import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class GitlabOwnerDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'name' })
  @IsString()
  name: string;
  @Expose({ name: 'avatar_url' })
  @IsString()
  avatarUrl: string;
}
