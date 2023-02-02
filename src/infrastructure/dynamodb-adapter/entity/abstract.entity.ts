import { attribute } from '@aws/dynamodb-data-mapper-annotations';

export default class AbstractEntity {
  @attribute({ defaultProvider: () => new Date() })
  public createdAt: Date;

  @attribute({ defaultProvider: () => new Date() })
  public updatedAt: Date;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
