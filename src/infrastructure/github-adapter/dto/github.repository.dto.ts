import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { GithubOwnerDTO } from 'src/infrastructure/github-adapter/dto/github.owner.dto';
import { GithubPermissionsDTO } from 'src/infrastructure/github-adapter/dto/github.permissions.dto';

export class GithubRepositoryDTO {
  @Expose({ name: 'id' })
  @IsNumber()
  id: number;
  @Expose({ name: 'name' })
  @IsString()
  name: string;
  @Expose({ name: 'owner' })
  @ValidateNested({ each: true })
  @Type(() => GithubOwnerDTO)
  owner: GithubOwnerDTO;
  @Expose({ name: 'pushed_at' })
  @IsString()
  @IsOptional()
  pushedAt: string;
  @Expose({ name: 'html_url' })
  @IsString()
  htmlUrl: string;
  @Expose({ name: 'permissions' })
  @ValidateNested({ each: true })
  @Type(() => GithubPermissionsDTO)
  permissions: GithubPermissionsDTO;
  @Expose({ name: 'default_branch' })
  @IsString()
  defaultBranch: string;
}
