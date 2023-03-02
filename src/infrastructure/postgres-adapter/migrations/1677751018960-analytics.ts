import { MigrationInterface, QueryRunner } from 'typeorm';

export class analytics1677751018960 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "analytics"`);
    await queryRunner.query(
      `CREATE TABLE "analytics"."sdk-values-read" (
               "createdAt"              TIMESTAMP WITH TIME ZONE               NOT NULL DEFAULT now(),
               "id"                     uuid                                   NOT NULL DEFAULT uuid_generate_v4(),
               "environmentId"          uuid                                   NOT NULL,
               "configurationId"        uuid                                   NOT NULL,
               "vcsType"                "public"."configurations_vcstype_enum" NOT NULL DEFAULT 'github',
               "repositoryVcsId"        integer                                NOT NULL,
               "repositoryVcsName"      character varying                      NOT NULL,
               "repositoryOwnerVcsId"   integer                                NOT NULL,
               "repositoryOwnerVcsName" character varying                      NOT NULL,
               CONSTRAINT "PK_analytics-sdk-values-read_id" PRIMARY KEY ("id")
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA "analytics"`);
    await queryRunner.query(`DROP TABLE "analytics.sdk-values-read"`);
  }
}
