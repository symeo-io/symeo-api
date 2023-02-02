import User from 'src/domain/model/user.model';
import { faker } from '@faker-js/faker';
import { VCSProvider } from 'src/domain/model/vcs-provider.enum';
import { OrganizationFacade } from 'src/domain/port/in/organization.facade.port';
import { instance, mock } from 'ts-mockito';
import { RepositoryFacade } from 'src/domain/port/in/repository.facade.port';
import { OrganizationController } from 'src/application/controller/organization.controller';
import { VcsOrganization } from 'src/domain/model/vcs.organization.model';
import { GetOrganizationsResponseDTO } from 'src/application/dto/get-organizations.response.dto';
import { OrganizationDTO } from 'src/application/dto/organization.dto';
import { VcsRepository } from 'src/domain/model/vcs.repository.model';
import { GetRepositoriesResponseDTO } from 'src/application/dto/get-repositories.response.dto';
import { VcsRepositoryDTO } from 'src/application/dto/vcsRepositoryDTO';

describe('OrganizationController', () => {
  describe('getOrganizations', () => {
    it('should get organizations for user', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
      );
      const mockedOrganizationFacade: OrganizationFacade =
        mock<OrganizationFacade>();
      const organizationFacade = instance(mockedOrganizationFacade);
      const mockedRepositoryFacade: RepositoryFacade = mock<RepositoryFacade>();
      const repositoryFacade = instance(mockedRepositoryFacade);
      const organizationController: OrganizationController =
        new OrganizationController(organizationFacade, repositoryFacade);

      const vcsOrganizations: VcsOrganization[] = [
        new VcsOrganization(
          faker.datatype.number(),
          faker.name.firstName(),
          faker.internet.url(),
          VCSProvider.GitHub,
        ),
        new VcsOrganization(
          faker.datatype.number(),
          faker.name.firstName(),
          faker.internet.url(),
          VCSProvider.GitHub,
        ),
      ];

      // When
      const organizationFacadeSpy = jest
        .spyOn(organizationFacade, 'getOrganizations')
        .mockImplementation(() => Promise.resolve(vcsOrganizations));

      const organizationsDTO: GetOrganizationsResponseDTO =
        await organizationController.getOrganizations(user);

      // Then
      expect(organizationsDTO.organizations.length).toEqual(2);
      expect(organizationsDTO.organizations[0]).toEqual(
        new OrganizationDTO(
          vcsOrganizations[0].vcsId,
          vcsOrganizations[0].name,
          vcsOrganizations[0].avatarUrl,
        ),
      );
      expect(organizationsDTO.organizations[1]).toEqual(
        new OrganizationDTO(
          vcsOrganizations[1].vcsId,
          vcsOrganizations[1].name,
          vcsOrganizations[1].avatarUrl,
        ),
      );
    });
  });

  describe('getRepositories', () => {
    it('should get repositories for organizationName', async () => {
      // Given
      const user: User = new User(
        faker.datatype.uuid(),
        faker.internet.email(),
        VCSProvider.GitHub,
      );
      const organizationName: string = faker.name.firstName();
      const mockedOrganizationFacade: OrganizationFacade =
        mock<OrganizationFacade>();
      const organizationFacade = instance(mockedOrganizationFacade);
      const mockedRepositoryFacade: RepositoryFacade = mock<RepositoryFacade>();
      const repositoryFacade = instance(mockedRepositoryFacade);
      const organizationController: OrganizationController =
        new OrganizationController(organizationFacade, repositoryFacade);

      const vcsRepositories: VcsRepository[] = [
        new VcsRepository(
          faker.datatype.number(),
          faker.name.firstName(),
          faker.name.fullName(),
          faker.datatype.datetime().toString(),
          VCSProvider.GitHub,
          faker.internet.url(),
        ),
        new VcsRepository(
          faker.datatype.number(),
          faker.name.firstName(),
          faker.name.fullName(),
          faker.datatype.datetime().toString(),
          VCSProvider.GitHub,
          faker.internet.url(),
        ),
      ];

      // When
      const repositoryFacadeSpy = jest
        .spyOn(repositoryFacade, 'getRepositories')
        .mockImplementation(() => Promise.resolve(vcsRepositories));
      const vcsRepositoriesDTO: GetRepositoriesResponseDTO =
        await organizationController.getRepositories(organizationName, user);

      // Then
      expect(vcsRepositoriesDTO.repositories.length).toEqual(2);
      expect(vcsRepositoriesDTO.repositories[0]).toEqual(
        new VcsRepositoryDTO(
          vcsRepositories[0].name,
          vcsRepositories[0].organization,
          vcsRepositories[0].pushedAt,
          VCSProvider.GitHub,
          vcsRepositories[0].vcsUrl,
        ),
      );
      expect(vcsRepositoriesDTO.repositories[1]).toEqual(
        new VcsRepositoryDTO(
          vcsRepositories[1].name,
          vcsRepositories[1].organization,
          vcsRepositories[1].pushedAt,
          VCSProvider.GitHub,
          vcsRepositories[1].vcsUrl,
        ),
      );
    });
  });
});
