import { MigrationInterface, QueryRunner } from 'typeorm';

const nomePermissao = 'caixa.alterar';

export class AddPermissaoAlterarCaixa1787600000000
  implements MigrationInterface
{
  name = 'AddPermissaoAlterarCaixa1787600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        INSERT INTO "permissions" ("name", "description")
        VALUES ($1, $2)
        ON CONFLICT ("name")
        DO UPDATE SET "description" = EXCLUDED."description"
      `,
      [nomePermissao, 'Permite alterar caixas abertos.'],
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
