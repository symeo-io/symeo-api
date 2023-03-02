import { VcsRepository } from 'src/domain/model/vcs/vcs.repository.model';
import { VcsRepositoryDTO } from 'src/application/webapp/dto/repository/repository.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetRepositoriesResponseDTO {
  @ApiProperty({ type: [VcsRepositoryDTO] })
  repositories: VcsRepositoryDTO[];

  static fromDomains(
    repositories: VcsRepository[],
  ): GetRepositoriesResponseDTO {
    const dto = new GetRepositoriesResponseDTO();
    dto.repositories = VcsRepositoryDTO.fromDomains(repositories);
    return dto;
  }
}
