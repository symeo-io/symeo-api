import { ApiProperty } from '@nestjs/swagger';
import { VcsBranchDTO } from 'src/application/webapp/dto/repository/branch.dto';
import { VcsBranch } from 'src/domain/model/vcs/vcs.branch.model';

export class GetRepositoryBranchesResponseDTO {
  @ApiProperty({ type: VcsBranchDTO })
  branches: VcsBranchDTO[];

  static fromDomains(branches: VcsBranch[]): GetRepositoryBranchesResponseDTO {
    const dto = new GetRepositoryBranchesResponseDTO();
    dto.branches = VcsBranchDTO.fromDomains(branches);
    return dto;
  }
}
