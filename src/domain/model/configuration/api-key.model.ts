import { v4 as uuid } from 'uuid';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { base64encode, base64decode } from 'nodejs-base64';

const KEY_HASH_SALT_ROUNDS = 14;

export default class ApiKey {
  id: string;
  environmentId: string;
  key?: string;
  hashedKey: string;
  hiddenKey: string;
  createdAt: Date;

  constructor(
    id: string,
    environmentId: string,
    key: string | undefined,
    hashedKey: string,
    hiddenKey: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.environmentId = environmentId;
    this.key = key;
    this.hashedKey = hashedKey;
    this.hiddenKey = hiddenKey;
    this.createdAt = createdAt;
  }

  static async buildForEnvironmentId(environmentId: string): Promise<ApiKey> {
    const id = uuid();
    const key = await ApiKey.generateKey();
    const hash = await ApiKey.hashKey(key);
    const hiddenKey = ApiKey.hideKey(key);

    return new ApiKey(id, environmentId, key, hash, hiddenKey, new Date());
  }

  public static async hashKey(key: string): Promise<string> {
    const salt = base64decode(key.split('.')[0]);
    return bcrypt.hash(key, salt);
  }

  private static async generateKey() {
    const salt = await bcrypt.genSalt(KEY_HASH_SALT_ROUNDS);

    const size = 32;
    const format = 'base64';
    const buffer = randomBytes(size);
    return base64encode(salt) + '.' + buffer.toString(format);
  }

  private static hideKey(key: string): string {
    return '••••••••••••' + key.slice(-4);
  }
}
