import { Expose, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GitlabOwnerDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.owner.dto';
import { GitlabPermissionsDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.permissions.dto';

export class GitlabRepositoryDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'name' })
  @IsString()
  name: string;
  @Expose({ name: 'namespace' })
  @ValidateNested({ each: true })
  @Type(() => GitlabOwnerDTO)
  owner: GitlabOwnerDTO;
  @Expose({ name: 'created_at' })
  @IsString()
  @IsOptional()
  pushedAt: string;
  @Expose({ name: 'web_url' })
  @IsString()
  htmlUrl: string;
  @Expose({ name: 'permissions' })
  @ValidateNested({ each: true })
  @Type(() => GitlabPermissionsDTO)
  permissions: GitlabPermissionsDTO;
  @Expose({ name: 'default_branch' })
  @IsString()
  defaultBranch: string;
}
