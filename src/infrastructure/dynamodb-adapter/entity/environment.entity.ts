import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.model';

export default class EnvironmentEntity {
  @attribute()
  id: string;

  @attribute()
  name: string;

  @attribute()
  color: EnvironmentColor;

  public toDomain(): Environment {
    return new Environment(this.id, this.name, this.color);
  }

  static fromDomain(environment: Environment): EnvironmentEntity {
    const entity = new EnvironmentEntity();
    entity.id = environment.id;
    entity.name = environment.name;
    entity.color = environment.color;

    return entity;
  }
}
