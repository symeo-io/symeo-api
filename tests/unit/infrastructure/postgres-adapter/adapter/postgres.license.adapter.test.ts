import { PostgresLicenseAdapter } from '../../../../../src/infrastructure/postgres-adapter/adapter/postgres.license.adapter';
import { mock } from 'ts-mockito';
import { Repository } from 'typeorm';
import LicenseEntity from '../../../../../src/infrastructure/postgres-adapter/entity/license/license.entity';
import License from '../../../../../src/domain/model/license/license.model';
import { PlanEnum } from '../../../../../src/domain/model/license/plan.enum';
import { v4 as uuid } from 'uuid';
import { faker } from '@faker-js/faker';

describe('PostgresLicenseAdapter', () => {
  describe('getLicenseForOrganizationIds', () => {
    it('should get licences for oganizationIds', async () => {
      // Given
      const licenseRepository = mock(Repository<LicenseEntity>);
      const postgresLicenseAdapter = new PostgresLicenseAdapter(
        licenseRepository,
      );

      const licenses = [
        new License(PlanEnum.FREE, uuid(), faker.datatype.number()),
        new License(PlanEnum.FREE, uuid(), faker.datatype.number()),
        new License(PlanEnum.APP_SUMO, uuid(), faker.datatype.number()),
      ];
      const licenseEntities = licenses.map(LicenseEntity.fromDomain);
      jest
        .spyOn(licenseRepository, 'findBy')
        .mockImplementation(() => Promise.resolve(licenseEntities));

      // When
      const expectedLicenses =
        await postgresLicenseAdapter.getLicenseForOrganizationIds([
          faker.datatype.number(),
          faker.datatype.number(),
        ]);

      // Then
      expect(expectedLicenses).toEqual(licenses);
    });
  });
});
