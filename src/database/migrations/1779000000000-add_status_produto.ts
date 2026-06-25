import { MigrationInterface, QueryRunner } from 'typeorm';

const permissoes = [
  {
    name: 'produto.alterar-status',
    description: 'Permite alterar o status de produtos.',
  },
];

export class AddStatusProduto1779000000000 implements MigrationInterface {
  name = 'AddStatusProduto1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."status_produto_enum" AS ENUM('ATIVO', 'INATIVO')
    `);
    await queryRunner.query(`
      ALTER TABLE "produto"
      ADD "status" "public"."status_produto_enum" NOT NULL DEFAULT 'ATIVO'
    `);

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

    await queryRunner.query(`
      ALTER TABLE "produto"
      DROP COLUMN "status"
    `);
    await queryRunner.query(`DROP TYPE "public"."status_produto_enum"`);
  }
}
