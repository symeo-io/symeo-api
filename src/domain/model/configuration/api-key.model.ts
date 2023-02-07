import { v4 as uuid } from 'uuid';
import { randomBytes } from 'crypto';
import { base64encode } from 'nodejs-base64';

export default class ApiKey {
  id: string;
  environmentId: string;
  key: string;

  constructor(id: string, environmentId: string, key: string) {
    this.id = id;
    this.environmentId = environmentId;
    this.key = key;
  }

  static buildForEnvironmentId(environmentId: string) {
    const id = uuid();
    const key = ApiKey.generateKey(id, environmentId);

    return new ApiKey(id, environmentId, key);
  }

  static generateKey(id: string, environmentId: string) {
    const header = ApiKey.generateKeyHeader(id, environmentId);
    const body = ApiKey.generateKeyBody();

    return `${header}.${body}`;
  }

  static generateKeyHeader(id: string, environmentId: string) {
    const objectHeader = { id, environmentId };
    const stringHeader = JSON.stringify(objectHeader);

    return base64encode(stringHeader);
  }

  static generateKeyBody() {
    const size = 32;
    const format = 'base64';
    const buffer = randomBytes(size);
    return buffer.toString(format);
  }
}
