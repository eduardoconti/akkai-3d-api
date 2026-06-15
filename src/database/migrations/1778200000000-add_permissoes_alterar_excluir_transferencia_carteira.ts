import { MigrationInterface, QueryRunner } from 'typeorm';

const permissoes = [
  {
    name: 'transferencia-carteira.alterar',
    description: 'Permite alterar transferencias entre carteiras.',
  },
  {
    name: 'transferencia-carteira.excluir',
    description: 'Permite excluir transferencias entre carteiras.',
  },
];

export class AddPermissoesAlterarExcluirTransferenciaCarteira1778200000000
  implements MigrationInterface
{
  name = 'AddPermissoesAlterarExcluirTransferenciaCarteira1778200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const valores = permissoes
      .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(', ');

    await queryRunner.query(
      `
        INSERT INTO "permissions" ("name", "description")
        VALUES ${valores}
        ON CONFLICT ("name")
        DO UPDATE SET "description" = EXCLUDED."description"
      `,
      permissoes.flatMap((permissao) => [
        permissao.name,
        permissao.description,
      ]),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const nomes = permissoes.map((permissao) => permissao.name);

    await queryRunner.query(
      `
        DELETE FROM "role_permissions" "rolePermission"
        USING "permissions" "permission"
        WHERE "rolePermission"."permission_id" = "permission"."id"
          AND "permission"."name" = ANY($1)
      `,
      [nomes],
    );
    await queryRunner.query(
      `
        DELETE FROM "permissions"
        WHERE "name" = ANY($1)
      `,
      [nomes],
    );
  }
}
