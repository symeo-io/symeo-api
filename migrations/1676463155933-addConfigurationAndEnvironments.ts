import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConfigurationAndEnvironments1676463155933
  implements MigrationInterface
{
  name = 'addConfigurationAndEnvironments1676463155933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."configurations_vcstype_enum" AS ENUM('github')`,
    );
    await queryRunner.query(
      `CREATE TABLE "configurations" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "vcsType" "public"."configurations_vcstype_enum" NOT NULL DEFAULT 'github', "repository" jsonb NOT NULL, "owner" jsonb NOT NULL, "configFormatFilePath" character varying NOT NULL, "branch" character varying NOT NULL, CONSTRAINT "PK_ef9fc29709cc5fc66610fc6a664" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "environments" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "configurationId" uuid, CONSTRAINT "PK_ec32d12469ec3c2f2f20c4f5e71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "environments" ADD CONSTRAINT "FK_acd813ac4a34b37f12aa67d492f" FOREIGN KEY ("configurationId") REFERENCES "configurations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "environments" DROP CONSTRAINT "FK_acd813ac4a34b37f12aa67d492f"`,
    );
    await queryRunner.query(`DROP TABLE "environments"`);
    await queryRunner.query(`DROP TABLE "configurations"`);
    await queryRunner.query(`DROP TYPE "public"."configurations_vcstype_enum"`);
  }
}
