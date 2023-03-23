import { ApiProperty } from '@nestjs/swagger';
import { EnvFile } from 'src/domain/model/vcs/env-file.model';

export class EnvFileDTO {
  @ApiProperty()
  path: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  contract: string;

  constructor(path: string, content: string, contract: string) {
    this.path = path;
    this.content = content;
    this.contract = contract;
  }

  public static fromDomains(envFiles: EnvFile[]): EnvFileDTO[] {
    return envFiles.map(EnvFileDTO.fromDomain);
  }

  public static fromDomain(envFile: EnvFile): EnvFileDTO {
    return new EnvFileDTO(envFile.path, envFile.content, envFile.getContract());
  }
}
