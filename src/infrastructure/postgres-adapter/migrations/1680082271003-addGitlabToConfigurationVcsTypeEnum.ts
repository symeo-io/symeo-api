import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGitlabToConfigurationVcsTypeEnum1680082271003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "public"."configurations_vcstype_enum" ADD VALUE IF NOT EXISTS \'gitlab\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE "public"."configurations_vcstype_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."configurations_vcstype_enum" AS ENUM('github')`,
    );
  }
}
