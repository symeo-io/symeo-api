import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameConfigFormatFilePath1676552328824
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configurations" RENAME COLUMN "configFormatFilePath" TO "contractFilePath"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "configurations" RENAME COLUMN "contractFilePath" TO "configFormatFilePath"`,
    );
  }
}
