import { Column, Entity, PrimaryColumn } from 'typeorm';
import AbstractEntity from '../abstract.entity';
import { PlanEnum } from '../../../../domain/model/licence/plan.enum';
import Licence from '../../../../domain/model/licence/licence.model';

@Entity('licences')
export default class LicenceEntity extends AbstractEntity {
  @PrimaryColumn({ unique: true })
  licenceKey: string;
  @Column()
  plan: PlanEnum;
  @Column({ nullable: true })
  organizationVcsId?: number;

  static fromDomain(licence: Licence) {
    const entity = new LicenceEntity();
    entity.licenceKey = licence.licenceKey;
    entity.plan = licence.plan;
    entity.organizationVcsId = licence.organizationVcsId;
    return entity;
  }

  public toDomain(): Licence {
    return new Licence(this.plan, this.licenceKey, this.organizationVcsId);
  }
}
