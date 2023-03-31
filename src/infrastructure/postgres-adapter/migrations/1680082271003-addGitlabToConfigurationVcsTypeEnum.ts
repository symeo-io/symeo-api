import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGitlabToConfigurationVcsTypeEnum1680082271003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configurations" ALTER COLUMN "vcsType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics-sdk-values-read" ALTER COLUMN "vcsType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(`DROP TYPE configurations_vcstype_enum`);
    await queryRunner.query(
      `CREATE TYPE configurations_vcstype_enum AS ENUM('github', 'gitlab)`,
    );
    await queryRunner.query(
      `ALTER TABLE "configurations" ALTER COLUMN "vcsType" TYPE configurations_vcstype_enum USING ("vcsType"::configurations_vcstype_enum)`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics-sdk-values-read" ALTER COLUMN "vcsType" TYPE configurations_vcstype_enum USING ("vcsType"::configurations_vcstype_enum)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configurations" ALTER COLUMN "vcsType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics-sdk-values-read" ALTER COLUMN "vcsType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(`DROP TYPE configurations_vcstype_enum`);
    await queryRunner.query(
      `CREATE TYPE configurations_vcstype_enum AS ENUM('github')`,
    );
    await queryRunner.query(
      `ALTER TABLE "configurations" ALTER COLUMN "vcsType" TYPE configurations_vcstype_enum USING ("vcsType"::configurations_vcstype_enum)`,
    );
    await queryRunner.query(
      `ALTER TABLE "analytics-sdk-values-read" ALTER COLUMN "vcsType" TYPE configurations_vcstype_enum USING ("vcsType"::configurations_vcstype_enum)`,
    );
  }
}
