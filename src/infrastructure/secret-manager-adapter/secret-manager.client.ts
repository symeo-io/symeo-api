import { SecretsManager } from 'aws-sdk';
import { config } from 'symeo-js/config';

export class SecretManagerClient {
  public client: SecretsManager;

  constructor() {
    this.client = new SecretsManager({
      credentials:
        config.aws.secretAccessKey && config.aws.accessKeyId
          ? {
              secretAccessKey: config.aws.secretAccessKey,
              accessKeyId: config.aws.accessKeyId,
            }
          : undefined,
      region: config.aws.region,
    });
  }
}
