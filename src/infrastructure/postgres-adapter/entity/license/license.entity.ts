import { Column, Entity, PrimaryColumn } from 'typeorm';
import AbstractEntity from '../abstract.entity';
import { PlanEnum } from '../../../../domain/model/license/plan.enum';
import License from '../../../../domain/model/license/license.model';

@Entity('licenses')
export default class LicenseEntity extends AbstractEntity {
  @PrimaryColumn({ unique: true })
  licenseKey: string;
  @Column()
  plan: PlanEnum;
  @Column({ nullable: true })
  organizationVcsId?: number;

  static fromDomain(license: License) {
    const entity = new LicenseEntity();
    entity.licenseKey = license.licenseKey;
    entity.plan = license.plan;
    entity.organizationVcsId = license.organizationVcsId;
    return entity;
  }

  public toDomain(): License {
    return new License(this.plan, this.licenseKey, this.organizationVcsId);
  }
}
