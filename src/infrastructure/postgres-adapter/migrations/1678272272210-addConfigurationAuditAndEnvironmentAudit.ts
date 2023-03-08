import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConfigurationAuditAndEnvironmentAudit1678272272210
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."configuration_audit_event_type_enum" AS ENUM('created','updated','deleted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."environment_audit_event_type_enum" AS ENUM('created','updated','deleted','permissionUpdated', 'apiKeyCreated', 'apiKeyDeleted', 'valuesUpdated', 'secretsRead')`,
    );

    await queryRunner.query(
      `CREATE TABLE "configuration-audits"
             (
                 "createdAt"       TIMESTAMP WITH TIME ZONE                       NOT NULL DEFAULT now(),
                 "id"              uuid                                           NOT NULL DEFAULT uuid_generate_v4(),
                 "configurationId" uuid                                           NOT NULL,
                 "eventType"       "public"."configuration_audit_event_type_enum" NOT NULL,
                 "repositoryVcsId" integer                                        NOT NULL,
                 "userId"          integer                                        NOT NULL,
                 "userName"        character varying                              NOT NULL,
                 "metadata"        jsonb,
                 CONSTRAINT "PK_configuration_audit_id" PRIMARY KEY ("id")
             )`,
    );

    await queryRunner.query(
      `CREATE TABLE "environment-audits"
             (
                 "createdAt"       TIMESTAMP WITH TIME ZONE                     NOT NULL DEFAULT now(),
                 "id"              uuid                                         NOT NULL DEFAULT uuid_generate_v4(),
                 "environmentId"   uuid                                         NOT NULL,
                 "eventType"       "public"."environment_audit_event_type_enum" NOT NULL,
                 "repositoryVcsId" integer                                      NOT NULL,
                 "userId"          integer                                      NOT NULL,
                 "userName"        character varying                            NOT NULL,
                 "metadata"        jsonb,
                 CONSTRAINT "PK_environment_audit_id" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "environment-audits"`);
    await queryRunner.query(`DROP TABLE "configuration-audits"`);
    await queryRunner.query(
      `DROP TYPE "public"."environment_audit_event_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."configuration_audit_event_type_enum"`,
    );
  }
}
