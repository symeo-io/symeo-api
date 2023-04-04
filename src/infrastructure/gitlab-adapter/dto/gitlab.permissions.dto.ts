import { Expose, Type } from 'class-transformer';
import { GitlabAccessDTO } from 'src/infrastructure/gitlab-adapter/dto/gitlab.access.dto';

export class GitlabPermissionsDTO {
  @Expose({ name: 'project_access' })
  @Type(() => GitlabAccessDTO)
  project_access: GitlabAccessDTO;
  @Expose({ name: 'group_access' })
  @Type(() => GitlabAccessDTO)
  group_access: GitlabAccessDTO;
}
