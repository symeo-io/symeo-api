import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import Environment from 'src/domain/model/environment/environment.model';
import { EnvironmentColor } from 'src/domain/model/environment/environment-color.enum';

export default class EnvironmentEntity {
  @attribute()
  id: string;

  @attribute()
  name: string;

  @attribute()
  color: string;

  public toDomain(): Environment {
    return new Environment(
      this.id,
      this.name,
      EnvironmentColor[this.color as keyof typeof EnvironmentColor],
    );
  }

  static fromDomain(environment: Environment): EnvironmentEntity {
    const entity = new EnvironmentEntity();
    entity.id = environment.id;
    entity.name = environment.name;
    entity.color = environment.color.toString();

    return entity;
  }
}
