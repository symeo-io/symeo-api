import { MigrationInterface, QueryRunner } from 'typeorm';

export class rollbackAudit1680247712034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TYPE "public"."environment_audit_event_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."environment_audit_event_type_enum" AS ENUM('created','updated','deleted','permissionUpdated', 'apiKeyCreated', 'apiKeyDeleted', 'valuesUpdated', 'secretsRead', 'versionRollback')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TYPE "public"."environment_audit_event_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."environment_audit_event_type_enum" AS ENUM('created','updated','deleted','permissionUpdated', 'apiKeyCreated', 'apiKeyDeleted', 'valuesUpdated', 'secretsRead')`,
    );
  }
}
