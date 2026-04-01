import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthModule1775000000000 implements MigrationInterface {
  name = 'AddAuthModule1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" character varying(255),
        CONSTRAINT "uq_roles_name" UNIQUE ("name"),
        CONSTRAINT "pk_roles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" character varying(255),
        CONSTRAINT "uq_permissions_name" UNIQUE ("name"),
        CONSTRAINT "pk_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying(150) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "name" character varying(150) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "role_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "ck_users_email_not_blank" CHECK (char_length(trim("email")) > 0),
        CONSTRAINT "uq_users_email" UNIQUE ("email"),
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id" SERIAL NOT NULL,
        "role_id" integer NOT NULL,
        "permission_id" integer NOT NULL,
        CONSTRAINT "uq_role_permissions_role_permission" UNIQUE ("role_id", "permission_id"),
        CONSTRAINT "pk_role_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" integer NOT NULL,
        "token_hash" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "revoked_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_refresh_sessions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "fk_users_role"
      FOREIGN KEY ("role_id")
      REFERENCES "roles"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "fk_role_permissions_role"
      FOREIGN KEY ("role_id")
      REFERENCES "roles"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "fk_role_permissions_permission"
      FOREIGN KEY ("permission_id")
      REFERENCES "permissions"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_sessions"
      ADD CONSTRAINT "fk_refresh_sessions_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_sessions" DROP CONSTRAINT "fk_refresh_sessions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_role_permissions_permission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_role_permissions_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "fk_users_role"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_sessions"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
