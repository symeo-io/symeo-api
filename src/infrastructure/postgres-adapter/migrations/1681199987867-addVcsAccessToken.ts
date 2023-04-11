import { MigrationInterface, QueryRunner } from 'typeorm';

export class addVcsAccessToken1681199987867 implements MigrationInterface {
  name = 'addVcsAccessToken1681199987867';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vcs-access-tokens"
             (
                 "createdAt"         TIMESTAMP WITH TIME ZONE               NOT NULL DEFAULT now(),
                 "updatedAt"         TIMESTAMP WITH TIME ZONE               NOT NULL DEFAULT now(),
                 "id"                uuid                                   NOT NULL DEFAULT uuid_generate_v4(),
                 "userId"            character varying                      NOT NULL,
                 "jwtExpirationDate" integer                                NOT NULL,
                 "vcsType"           "public"."configurations_vcstype_enum" NOT NULL DEFAULT 'gitlab',
                 "accessToken"       character varying                      NOT NULL,
                 "expirationDate"    integer,
                 "refreshToken"      character varying,
                 CONSTRAINT "PK_vcs_access_token_id" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "vcs-access-tokens"`);
  }
}
