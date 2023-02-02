import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { VcsRepositoryDTO } from 'src/application/dto/vcsRepositoryDTO';

export class GetRepositoriesResponseDTO {
  repositories: VcsRepositoryDTO[];

  static fromDomains(
    repositories: VcsRepository[],
  ): GetRepositoriesResponseDTO {
    const dto = new GetRepositoriesResponseDTO();
    dto.repositories = VcsRepositoryDTO.fromDomains(repositories);
    return dto;
  }
}
