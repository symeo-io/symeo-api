import { PlanEnum } from './plan.enum';

export default class License {
  plan: PlanEnum;
  licenseKey: string;
  organizationVcsId?: number;

  constructor(plan: PlanEnum, licenseKey: string, organizationVcsId?: number) {
    this.plan = plan;
    this.licenseKey = licenseKey;
    this.organizationVcsId = organizationVcsId;
  }
}
