import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddItemVendaToMovimentacaoEstoque1775400000000
  implements MigrationInterface
{
  name = 'AddItemVendaToMovimentacaoEstoque1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ADD "id_item_venda" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movimentacao_estoque_id_item_venda" ON "movimentacao_estoque" ("id_item_venda") `,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "fk_movimentacao_estoque_item_venda" FOREIGN KEY ("id_item_venda") REFERENCES "item_venda"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" DROP CONSTRAINT "fk_movimentacao_estoque_item_venda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_movimentacao_estoque_id_item_venda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" DROP COLUMN "id_item_venda"`,
    );
  }
}
