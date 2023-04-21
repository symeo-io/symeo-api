import License from '../../model/license/license.model';

export interface LicenseStoragePort {
  findForOrganizationIds(
    vcsOrganizationIds: number[],
  ): Promise<License[] | undefined>;

  findForLicenseKey(licenseKey: string): Promise<License | undefined>;

  save(license: License): Promise<void>;
}
