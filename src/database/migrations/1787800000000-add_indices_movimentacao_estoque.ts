import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndicesMovimentacaoEstoque1787800000000
  implements MigrationInterface
{
  name = 'AddIndicesMovimentacaoEstoque1787800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_movimentacao_estoque_data_inclusao" ON "movimentacao_estoque" ("data_inclusao", "id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movimentacao_estoque_origem_tipo_data_inclusao" ON "movimentacao_estoque" ("origem", "tipo", "data_inclusao")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_movimentacao_estoque_origem_tipo_data_inclusao"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_movimentacao_estoque_data_inclusao"`,
    );
  }
}
