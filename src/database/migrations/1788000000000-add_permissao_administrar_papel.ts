import { MigrationInterface, QueryRunner } from 'typeorm';

const nomePermissao = 'papel.administrar';

export class AddPermissaoAdministrarPapel1788000000000
  implements MigrationInterface
{
  name = 'AddPermissaoAdministrarPapel1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "permissions" ("name", "description")
        VALUES ($1, $2)
        ON CONFLICT ("name")
        DO UPDATE SET "description" = EXCLUDED."description"
      `,
      [nomePermissao, 'Permite criar, alterar e excluir papéis.'],
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
  }
}
