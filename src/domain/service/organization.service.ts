import { OrganizationFacade } from '../port/in/organization.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import { LicenseStoragePort } from '../port/out/license.storage.port';
import License from '../model/license/license.model';

export class OrganizationService implements OrganizationFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly gitlabAdapterPort: GitlabAdapterPort,
    private readonly licenseStoragePort: LicenseStoragePort,
  ) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    const vcsOrganizations = await this.getVcsOrganizations(user);
    if (vcsOrganizations.length > 0) {
      const vcsOrganizationIds = vcsOrganizations.map(
        (vcsOrganization) => vcsOrganization.vcsId,
      );
      const licenses =
        await this.licenseStoragePort.getLicenseForOrganizationIds(
          vcsOrganizationIds,
        );
      return this.getVcsOrganizationsWithLicences(vcsOrganizations, licenses);
    }
    return [];
  }

  private async getVcsOrganizations(user: User): Promise<VcsOrganization[]> {
    switch (user.provider) {
      case VCSProvider.GitHub:
        return await this.githubAdapterPort.getOrganizations(user);
      case VCSProvider.Gitlab:
        return await this.gitlabAdapterPort.getOrganizations(user);
      default:
        return [];
    }
  }

  private getVcsOrganizationsWithLicences(
    vcsOrganizations: VcsOrganization[],
    persistedLicenses: License[] | undefined,
  ): VcsOrganization[] {
    if (persistedLicenses) {
      const vcsOrganizationsWithLicense: VcsOrganization[] = [];
      vcsOrganizations.map((vcsOrganization) => {
        const licenseForVcsOrganization = this.getLicenseForVcsOrganization(
          vcsOrganization,
          persistedLicenses,
        );
        if (licenseForVcsOrganization) {
          const licenseForVcsOrganizationWithHiddenKey = this.hideLicenseKey(
            licenseForVcsOrganization,
          );
          const vcsOrganizationWithLicense = {
            ...vcsOrganization,
            license: licenseForVcsOrganizationWithHiddenKey,
          } as VcsOrganization;
          vcsOrganizationsWithLicense.push(vcsOrganizationWithLicense);
          return;
        }
        vcsOrganizationsWithLicense.push(vcsOrganization);
      });
      return vcsOrganizationsWithLicense;
    }
    return vcsOrganizations;
  }

  private getLicenseForVcsOrganization(
    vcsOrganization: VcsOrganization,
    persistedLicenses: License[],
  ): License | undefined {
    return persistedLicenses.find(
      (persistedLicense) =>
        persistedLicense.organizationVcsId === vcsOrganization.vcsId,
    );
  }

  private hideLicenseKey(licenseForVcsOrganization: License): License {
    const hiddenLicenseKey = this.maskCharacter(
      licenseForVcsOrganization.licenseKey,
      4,
    );
    return {
      ...licenseForVcsOrganization,
      licenseKey: hiddenLicenseKey,
    } as License;
  }

  private maskCharacter(licenseKey: string, numberOfCharacterToShow: number) {
    return (
      ('' + licenseKey).slice(0, -numberOfCharacterToShow).replace(/./g, '*') +
      ('' + licenseKey).slice(-numberOfCharacterToShow)
    );
  }
}
