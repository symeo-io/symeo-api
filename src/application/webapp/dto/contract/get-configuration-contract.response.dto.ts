import { ConfigurationContract } from 'src/domain/model/configuration/configuration-contract.model';

export class GetConfigurationContractResponseDTO {
  contract: ConfigurationContract;

  constructor(contract: ConfigurationContract) {
    this.contract = contract;
  }
}
