import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import Environment from 'src/domain/model/configuration/environment.model';

export default class EnvironmentEntity {
  @attribute()
  id: string;

  @attribute()
  name: string;

  public toDomain(): Environment {
    return new Environment(this.id, this.name);
  }

  static fromDomain(environment: Environment): EnvironmentEntity {
    const entity = new EnvironmentEntity();
    entity.id = environment.id;
    entity.name = environment.name;

    return entity;
  }
}
