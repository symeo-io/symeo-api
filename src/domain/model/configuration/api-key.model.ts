import { v4 as uuid } from 'uuid';
import { randomBytes } from 'crypto';

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
    const key = ApiKey.generateKey();

    return new ApiKey(id, environmentId, key, new Date());
  }

  private static generateKey() {
    const size = 32;
    const format = 'base64';
    const buffer = randomBytes(size);
    return buffer.toString(format);
  }
}
