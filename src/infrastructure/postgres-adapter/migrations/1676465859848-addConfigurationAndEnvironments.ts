import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConfigurationAndEnvironments1676465859848
  implements MigrationInterface
{
  name = 'addConfigurationAndEnvironments1676465859848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."configurations_vcstype_enum" AS ENUM('github')`,
    );

    await queryRunner.query(
      `CREATE TABLE "configurations" (
               "createdAt"            TIMESTAMP WITH TIME ZONE               NOT NULL DEFAULT now(),
               "updatedAt"            TIMESTAMP WITH TIME ZONE               NOT NULL DEFAULT now(),
               "id"                   uuid                                   NOT NULL DEFAULT uuid_generate_v4(),
               "name"                 character varying                      NOT NULL,
               "vcsType"              "public"."configurations_vcstype_enum" NOT NULL DEFAULT 'github',
               "repositoryVcsId"      integer                                NOT NULL,
               "repositoryVcsName"    character varying                      NOT NULL,
               "ownerVcsId"           integer                                NOT NULL,
               "ownerVcsName"         character varying                      NOT NULL,
               "contractFilePath"     character varying                      NOT NULL,
               "branch"               character varying                      NOT NULL,
               CONSTRAINT "PK_configuration_id" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_configurations_vcsRepository ON "configurations" ("repositoryVcsId", "vcsType")`,
    );

    await queryRunner.query(
      `CREATE TABLE "environments" (
                "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id"              uuid                     NOT NULL DEFAULT uuid_generate_v4(), 
                "name"            character varying        NOT NULL, 
                "color"           character varying        NOT NULL, 
                "configurationId" uuid                     NOT NULL,
                CONSTRAINT "PK_environment_id" PRIMARY KEY ("id")
              )`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_environments_configurationId ON "environments" ("configurationId")`,
    );

    await queryRunner.query(
      `CREATE TABLE "api-keys" (
                "createdAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id"            uuid                     NOT NULL DEFAULT uuid_generate_v4(), 
                "environmentId" uuid                     NOT NULL,
                "hashedKey"     character varying        NOT NULL, 
                "hiddenKey"     character varying        NOT NULL, 
                CONSTRAINT "PK_api_key_id" PRIMARY KEY ("id")
              )`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_api_keys_environmentId ON "api-keys" ("environmentId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "environments" 
                ADD CONSTRAINT "FK_environment_configuration_id" FOREIGN KEY ("configurationId") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "api-keys"
                ADD CONSTRAINT "FK_api_keys_environment" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "environments" DROP CONSTRAINT "FK_environment_configuration_id"`,
    );
    await queryRunner.query(`DROP TABLE "api-keys"`);
    await queryRunner.query(`DROP TABLE "configurations"`);
    await queryRunner.query(`DROP TABLE "environments"`);
    await queryRunner.query(`DROP TYPE "public"."configurations_vcstype_enum"`);
  }
}
