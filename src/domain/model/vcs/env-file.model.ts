import { EnvFileToContractService } from 'src/domain/service/env-file-to-contract.service';
import * as env from 'envfile';
import * as YAML from 'yamljs';

export class EnvFile {
  path: string;
  content: string;
  constructor(path: string, content: string) {
    this.path = path;
    this.content = content;
  }

  public getContract(): string {
    const contract = EnvFileToContractService.convert(env.parse(this.content));
    return YAML.stringify(contract, Number.MAX_VALUE, 2);
  }
}
