import { ApiProperty } from '@nestjs/swagger';
import { EnvFileDTO } from 'src/application/webapp/dto/repository/env-file.dto';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';

export class GetRepositoryEnvFilesResponseDTO {
  @ApiProperty({ type: EnvFileDTO })
  files: EnvFileDTO[];

  static fromDomains(envFiles: EnvFile[]): GetRepositoryEnvFilesResponseDTO {
    const dto = new GetRepositoryEnvFilesResponseDTO();
    dto.files = EnvFileDTO.fromDomains(envFiles);
    return dto;
  }
}
