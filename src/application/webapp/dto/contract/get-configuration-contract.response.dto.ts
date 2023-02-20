import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';
import { ApiProperty } from '@nestjs/swagger';

export class GetConfigurationContractResponseDTO {
  @ApiProperty()
  contract: ConfigurationContract;

  constructor(contract: ConfigurationContract) {
    this.contract = contract;
  }
}
