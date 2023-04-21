import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLicences1682061548605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."license_plan" AS ENUM('free', 'appSumo')`,
    );

    await queryRunner.query(
      `CREATE TABLE "licenses"
             (
                 "createdAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "licenseKey"        character varying        NOT NULL,
                 "plan"              "public"."license_plan"  NOT NULL,
                 "organizationVcsId" integer                           DEFAULT NULL,
                 CONSTRAINT "PK_license_key" PRIMARY KEY ("licenseKey"),
                 UNIQUE ("licenseKey", "organizationVcsId")

             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "licenses"`);
    await queryRunner.query(`DROP TYPE "public"."license_plan"`);
  }
}
