import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { GithubCommitDTO } from 'src/infrastructure/github-adapter/dto/github.commit.dto';

export class GithubBranchDTO {
  @Expose({ name: 'name' })
  @IsString()
  name: string;
  @Expose({ name: 'commit' })
  @ValidateNested({ each: true })
  @Type(() => GithubCommitDTO)
  commit: GithubCommitDTO;
}
