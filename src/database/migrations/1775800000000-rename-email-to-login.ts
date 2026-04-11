import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEmailToLogin1775800000000 implements MigrationInterface {
  name = 'RenameEmailToLogin1775800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_users_is_active_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "ck_users_email_not_blank"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_users_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "email" TO "login"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "uq_users_login" UNIQUE ("login")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "ck_users_login_letters_only" CHECK ("login" ~ '^[A-Za-z]+$')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "ck_users_login_min_length" CHECK (char_length(trim("login")) >= 3)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_is_active_login" ON "users" ("is_active", "login") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_users_is_active_login"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "ck_users_login_min_length"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "ck_users_login_letters_only"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_users_login"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "login" TO "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "uq_users_email" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "ck_users_email_not_blank" CHECK (char_length(trim("email")) > 0)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_is_active_email" ON "users" ("is_active", "email") `,
    );
  }
}
