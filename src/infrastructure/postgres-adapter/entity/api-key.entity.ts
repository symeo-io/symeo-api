import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import ApiKey from 'src/domain/model/configuration/api-key.model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api-keys')
export default class ApiKeyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  environmentId: string;

  @Column()
  key: string;

  public toDomain(): ApiKey {
    return new ApiKey(this.id, this.environmentId, this.key, this.createdAt);
  }

  static fromDomain(apiKey: ApiKey): ApiKeyEntity {
    const entity = new ApiKeyEntity();
    entity.id = apiKey.id;
    entity.environmentId = apiKey.environmentId;
    entity.key = apiKey.key;
    entity.createdAt = apiKey.createdAt;

    return entity;
  }
}
