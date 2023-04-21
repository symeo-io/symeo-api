import { PostgresLicenceAdapter } from '../../../../../src/infrastructure/postgres-adapter/adapter/postgres.licence.adapter';
import { mock } from 'ts-mockito';
import { Repository } from 'typeorm';
import LicenceEntity from '../../../../../src/infrastructure/postgres-adapter/entity/licence/licence.entity';
import Licence from '../../../../../src/domain/model/licence/licence.model';
import { PlanEnum } from '../../../../../src/domain/model/licence/plan.enum';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';

describe('PostgresLicenceAdapter', () => {
  describe('getLicenceForOrganizationIds', () => {
    it('should get licences for oganizationIds', async () => {
      // Given
      const licenceRepository = mock(Repository<LicenceEntity>);
      const postgresLicenceAdapter = new PostgresLicenceAdapter(
        licenceRepository,
      );

      const licences = [
        new Licence(PlanEnum.FREE, uuid(), faker.datatype.number()),
        new Licence(PlanEnum.FREE, uuid(), faker.datatype.number()),
        new Licence(PlanEnum.APP_SUMO, uuid(), faker.datatype.number()),
      ];
      const licenceEntities = licences.map(LicenceEntity.fromDomain);
      jest
        .spyOn(licenceRepository, 'findBy')
        .mockImplementation(() => Promise.resolve(licenceEntities));

      // When
      const expectedLicences =
        await postgresLicenceAdapter.findForOrganizationIds([
          faker.datatype.number(),
          faker.datatype.number(),
        ]);

      // Then
      expect(expectedLicences).toEqual(licences);
    });
  });
});
