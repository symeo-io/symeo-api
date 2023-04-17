import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { GitlabCommitDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.commit.dto';

export class GitlabBranchDTO {
  @Expose({ name: 'name' })
  @IsString()
  name: string;
  @Expose({ name: 'commit' })
  @ValidateNested({ each: true })
  @Type(() => GitlabCommitDTO)
  commit: GitlabCommitDTO;
}
