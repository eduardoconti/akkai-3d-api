import { MigrationInterface, QueryRunner } from 'typeorm';

const nomePermissao = 'usuario.administrar-permissoes';

export class CreateUserPermissions1787900000000 implements MigrationInterface {
  name = 'CreateUserPermissions1787900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_permissions" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "permission_id" integer NOT NULL,
        "granted" boolean NOT NULL,
        CONSTRAINT "pk_user_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "uk_user_permissions_user_permission" UNIQUE ("user_id", "permission_id"),
        CONSTRAINT "fk_user_permissions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "fk_user_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `
        INSERT INTO "permissions" ("name", "description")
        VALUES ($1, $2)
        ON CONFLICT ("name")
        DO UPDATE SET "description" = EXCLUDED."description"
      `,
      [
        nomePermissao,
        'Permite administrar o papel e as permissões individuais dos usuários.',
      ],
    );

    // Só o papel administrador recebe a permissão: ela não vem por padrão.
    await queryRunner.query(
      `
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        SELECT "role"."id", "permission"."id"
        FROM "roles" "role"
        CROSS JOIN "permissions" "permission"
        WHERE "role"."name" = 'admin'
          AND "permission"."name" = $1
          AND NOT EXISTS (
            SELECT 1 FROM "role_permissions" "existing"
            WHERE "existing"."role_id" = "role"."id"
              AND "existing"."permission_id" = "permission"."id"
          )
      `,
      [nomePermissao],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        DELETE FROM "role_permissions" "rolePermission"
        USING "permissions" "permission"
        WHERE "rolePermission"."permission_id" = "permission"."id"
          AND "permission"."name" = $1
      `,
      [nomePermissao],
    );
    await queryRunner.query(`DELETE FROM "permissions" WHERE "name" = $1`, [
      nomePermissao,
    ]);
    await queryRunner.query(`DROP TABLE "user_permissions"`);
  }
}
