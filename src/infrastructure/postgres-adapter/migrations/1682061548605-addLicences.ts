import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLicences1682061548605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."licence_plan" AS ENUM('free', 'appSumo')`,
    );

    await queryRunner.query(
      `CREATE TABLE "licences"
             (
                 "createdAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "updatedAt"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                 "licenceKey"        character varying        NOT NULL,
                 "plan"              "public"."licence_plan"  NOT NULL,
                 "organizationVcsId" integer                           DEFAULT NULL,
                 CONSTRAINT "PK_licence_key" PRIMARY KEY ("licenceKey"),
                 UNIQUE ("licenceKey", "organizationVcsId")

             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "licences"`);
    await queryRunner.query(`DROP TYPE "public"."licence_plan"`);
  }
}
