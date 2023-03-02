import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEnvironmentPermission1676909322836
  implements MigrationInterface
{
  name = 'addEnvironmentPermission1676909322836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."environment_permission_role_enum" AS ENUM('readNonSecret','readSecret','write','admin')`,
    );

    await queryRunner.query(
      `CREATE TABLE "environment-permissions"
             (
                 "createdAt"                 TIMESTAMP WITH TIME ZONE                    NOT NULL DEFAULT now(),
                 "updatedAt"                 TIMESTAMP WITH TIME ZONE                    NOT NULL DEFAULT now(),
                 "id"                        uuid                                        NOT NULL DEFAULT uuid_generate_v4(),
                 "userVcsId"                 integer                                     NOT NULL,
                 "environmentPermissionRole" "public"."environment_permission_role_enum" NOT NULL DEFAULT 'readNonSecret',
                 "environmentId"             uuid                                        NOT NULL,
                 CONSTRAINT "PK_environment_permission_id" PRIMARY KEY ("id"),
                 UNIQUE ("userVcsId", "environmentId")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "environment-permissions"`);
    await queryRunner.query(
      `DROP TYPE "public"."environment_permission_role_enum"`,
    );
  }
}
