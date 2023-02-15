import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConfigurationAndEnvironments1676465859848
  implements MigrationInterface
{
  name = 'addConfigurationAndEnvironments1676465859848';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "environments" (
                "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id"              uuid                     NOT NULL DEFAULT uuid_generate_v4(), 
                "name"            character varying        NOT NULL, 
                "color"           character varying        NOT NULL, 
                "configurationId" uuid,
                CONSTRAINT "PK_environment_id" PRIMARY KEY ("id")
              )`,
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
                "configFormatFilePath" character varying                      NOT NULL, 
                "branch"               character varying                      NOT NULL, 
                CONSTRAINT "PK_configuration_id" PRIMARY KEY ("id")
              )`,
    );
    await queryRunner.query(
      `CREATE TABLE "api-keys" (
                "createdAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "id"            uuid                     NOT NULL DEFAULT uuid_generate_v4(), 
                "environmentId" character varying        NOT NULL, 
                "key"           character varying        NOT NULL, 
                CONSTRAINT "PK_api_key_id" PRIMARY KEY ("id")
              )`,
    );
    await queryRunner.query(
      `ALTER TABLE "environments" 
                ADD CONSTRAINT "FK_environment_configuration_id" FOREIGN KEY ("configurationId") REFERENCES "configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "environments" DROP CONSTRAINT "FK_environment_configuration_id"`,
    );
    await queryRunner.query(`DROP TABLE "api-keys"`);
    await queryRunner.query(`DROP TABLE "configurations"`);
    await queryRunner.query(`DROP TABLE "environments"`);
  }
}
