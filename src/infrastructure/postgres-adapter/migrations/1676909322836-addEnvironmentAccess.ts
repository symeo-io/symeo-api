import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEnvironmentAccess1676909322836 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."environment_access_role_enum" AS ENUM('readNonSecrets')`,
    );

    await queryRunner.query(`CREATE TABLE "environment-accesses"
                                 (
                                     "createdAt"             TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT now(),
                                     "updatedAt"             TIMESTAMP WITH TIME ZONE                NOT NULL DEFAULT now(),
                                     "id"                    uuid                                    NOT NULL DEFAULT uuid_generate_v4(),
                                     "userVcsId"             integer,
                                     "userName"              character varying                       NOT NULL,
                                     "userAvatarUrl"         character varying                       NOT NULL,
                                     "environmentAccessRole" "public"."environment_access_role_enum" NOT NULL DEFAULT 'readNonSecrets',
                                     "environmentId"         uuid                                    NOT NULL,
                                     CONSTRAINT "PK_environment_access_id" PRIMARY KEY ("id")
                                 )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "environment-accesses"`);
    await queryRunner.query(
      `DROP TYPE "public"."environment_access_role_enum"`,
    );
  }
}
