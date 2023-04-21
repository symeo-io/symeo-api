import License from '../../model/license/license.model';

export interface LicenseStoragePort {
  getLicenseForOrganizationIds(
    vcsOrganizationIds: number[],
  ): Promise<License[] | undefined>;
}
