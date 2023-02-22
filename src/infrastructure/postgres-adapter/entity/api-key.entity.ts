import AbstractEntity from 'src/infrastructure/postgres-adapter/entity/abstract.entity';
import ApiKey from 'src/domain/model/environment/api-key.model';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api-keys')
export default class ApiKeyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  environmentId: string;

  @Column()
  hashedKey: string;

  @Column()
  hiddenKey: string;

  public toDomain(): ApiKey {
    return new ApiKey(
      this.id,
      this.environmentId,
      undefined,
      this.hashedKey,
      this.hiddenKey,
      this.createdAt,
    );
  }

  static fromDomain(apiKey: ApiKey): ApiKeyEntity {
    const entity = new ApiKeyEntity();
    entity.id = apiKey.id;
    entity.environmentId = apiKey.environmentId;
    entity.hashedKey = apiKey.hashedKey;
    entity.hiddenKey = apiKey.hiddenKey;
    entity.createdAt = apiKey.createdAt;

    return entity;
  }
}
