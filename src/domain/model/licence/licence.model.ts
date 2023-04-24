import { PlanEnum } from './plan.enum';

export default class Licence {
  plan: PlanEnum;
  licenceKey: string;
  organizationVcsId?: number;

  constructor(plan: PlanEnum, licenceKey: string, organizationVcsId?: number) {
    this.plan = plan;
    this.licenceKey = licenceKey;
    this.organizationVcsId = organizationVcsId;
  }
}
