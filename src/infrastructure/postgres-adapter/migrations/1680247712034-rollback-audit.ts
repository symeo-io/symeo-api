import { MigrationInterface, QueryRunner } from 'typeorm';

export class rollbackAudit1680247712034 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "environment-audits" ALTER COLUMN "eventType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(`DROP TYPE environment_audit_event_type_enum`);
    await queryRunner.query(
      `CREATE TYPE environment_audit_event_type_enum AS ENUM('created','updated','deleted','permissionUpdated', 'apiKeyCreated', 'apiKeyDeleted', 'valuesUpdated', 'secretsRead', 'versionRollback')`,
    );
    await queryRunner.query(
      `ALTER TABLE "environment-audits" ALTER COLUMN "eventType" TYPE environment_audit_event_type_enum USING ("eventType"::environment_audit_event_type_enum)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "environment-audits" ALTER COLUMN "eventType" TYPE VARCHAR(255)`,
    );
    await queryRunner.query(`DROP TYPE environment_audit_event_type_enum`);
    await queryRunner.query(
      `CREATE TYPE environment_audit_event_type_enum AS ENUM('created','updated','deleted','permissionUpdated', 'apiKeyCreated', 'apiKeyDeleted', 'valuesUpdated', 'secretsRead')`,
    );
    await queryRunner.query(
      `ALTER TABLE "environment-audits" ALTER COLUMN "eventType" TYPE environment_audit_event_type_enum USING ("eventType"::"environment_audit_event_type_enum")`,
    );
  }
}
