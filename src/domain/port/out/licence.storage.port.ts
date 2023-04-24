import Licence from '../../model/licence/licence.model';

export interface LicenceStoragePort {
  findForOrganizationIds(
    vcsOrganizationIds: number[],
  ): Promise<Licence[] | undefined>;

  findForLicenceKey(licenceKey: string): Promise<Licence | undefined>;

  save(licence: Licence): Promise<void>;
}
