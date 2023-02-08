import { v4 as uuid } from 'uuid';
import { randomBytes } from 'crypto';
import { base64encode } from 'nodejs-base64';

export default class ApiKey {
  id: string;
  environmentId: string;
  key: string;
  createdAt: Date;

  constructor(id: string, environmentId: string, key: string, createdAt: Date) {
    this.id = id;
    this.environmentId = environmentId;
    this.key = key;
    this.createdAt = createdAt;
  }

  static buildForEnvironmentId(environmentId: string) {
    const id = uuid();
    const key = ApiKey.generateKey(id, environmentId);

    return new ApiKey(id, environmentId, key, new Date());
  }

  static generateKey(id: string, environmentId: string) {
    const header = ApiKey.generateKeyHeader(id, environmentId);
    const body = ApiKey.generateKeyBody();

    return `${header}.${body}`;
  }

  private static generateKeyHeader(id: string, environmentId: string) {
    const objectHeader = { id, environmentId };
    const stringHeader = JSON.stringify(objectHeader);

    return base64encode(stringHeader);
  }

  private static generateKeyBody() {
    const size = 32;
    const format = 'base64';
    const buffer = randomBytes(size);
    return buffer.toString(format);
  }
}
