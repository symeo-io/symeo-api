import { OrganizationFacade } from '../port/in/organization.facade.port';
import GithubAdapterPort from '../port/out/github.adapter.port';
import User from 'src/domain/model/user/user.model';
import { VcsOrganization } from 'src/domain/model/vcs/vcs.organization.model';
import { VCSProvider } from 'src/domain/model/vcs/vcs-provider.enum';
import { GitlabAdapterPort } from 'src/domain/port/out/gitlab.adapter.port';
import { LicenceStoragePort } from '../port/out/licence.storage.port';
import Licence from '../model/licence/licence.model';
import { SymeoExceptionCode } from '../exception/symeo.exception.code.enum';
import { SymeoException } from '../exception/symeo.exception';
import { PlanEnum } from '../model/licence/plan.enum';

export class OrganizationService implements OrganizationFacade {
  constructor(
    private readonly githubAdapterPort: GithubAdapterPort,
    private readonly gitlabAdapterPort: GitlabAdapterPort,
    private readonly licenceStoragePort: LicenceStoragePort,
  ) {}

  async getOrganizations(user: User): Promise<VcsOrganization[]> {
    const vcsOrganizations = await this.getVcsOrganizations(user);
    if (vcsOrganizations.length > 0) {
      const vcsOrganizationIds = vcsOrganizations.map(
        (vcsOrganization) => vcsOrganization.vcsId,
      );
      const licences = await this.licenceStoragePort.findForOrganizationIds(
        vcsOrganizationIds,
      );
      return this.getVcsOrganizationsWithLicences(vcsOrganizations, licences);
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
    persistedLicences: Licence[] | undefined,
  ): VcsOrganization[] {
    if (persistedLicences) {
      const vcsOrganizationsWithLicence: VcsOrganization[] = [];
      vcsOrganizations.map((vcsOrganization) => {
        const licenceForVcsOrganization = this.getLicenceForVcsOrganization(
          vcsOrganization,
          persistedLicences,
        );
        if (licenceForVcsOrganization) {
          const licenceForVcsOrganizationWithHiddenKey = this.hideLicenceKey(
            licenceForVcsOrganization,
          );
          const vcsOrganizationWithLicence = {
            ...vcsOrganization,
            licence: licenceForVcsOrganizationWithHiddenKey,
          } as VcsOrganization;
          vcsOrganizationsWithLicence.push(vcsOrganizationWithLicence);
          return;
        }
        vcsOrganizationsWithLicence.push(vcsOrganization);
      });
      return vcsOrganizationsWithLicence;
    }
    return vcsOrganizations;
  }

  private getLicenceForVcsOrganization(
    vcsOrganization: VcsOrganization,
    persistedLicences: Licence[],
  ): Licence | undefined {
    return persistedLicences.find(
      (persistedLicence) =>
        persistedLicence.organizationVcsId === vcsOrganization.vcsId,
    );
  }

  private hideLicenceKey(licenceForVcsOrganization: Licence): Licence {
    const hiddenLicenceKey = this.maskCharacter(
      licenceForVcsOrganization.licenceKey,
      4,
    );
    return {
      ...licenceForVcsOrganization,
      licenceKey: hiddenLicenceKey,
    } as Licence;
  }

  private maskCharacter(licenceKey: string, numberOfCharacterToShow: number) {
    return (
      ('' + licenceKey).slice(0, -numberOfCharacterToShow).replace(/./g, '*') +
      ('' + licenceKey).slice(-numberOfCharacterToShow)
    );
  }

  async updateLicence(
    user: User,
    organizationId: number,
    licenceKey: string,
  ): Promise<Licence> {
    const persistedLicence = await this.licenceStoragePort.findForLicenceKey(
      licenceKey,
    );
    if (!persistedLicence) {
      throw new SymeoException(
        'Licence key not valid.',
        SymeoExceptionCode.LICENSE_KEY_NOT_FOUND,
      );
    }
    if (persistedLicence.organizationVcsId) {
      throw new SymeoException(
        'The licence key has already been used.',
        SymeoExceptionCode.LICENSE_KEY_ALREADY_USED,
      );
    }
    const updatedLicence = new Licence(
      PlanEnum.APP_SUMO,
      licenceKey,
      organizationId,
    );
    await this.licenceStoragePort.save(updatedLicence);
    return this.hideLicenceKey(updatedLicence);
  }
}
