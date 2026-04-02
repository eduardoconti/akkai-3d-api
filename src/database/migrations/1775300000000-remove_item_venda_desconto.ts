import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveItemVendaDesconto1775300000000
  implements MigrationInterface
{
  name = 'RemoveItemVendaDesconto1775300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT IF EXISTS "ck_item_venda_desconto_nao_negativo"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT IF EXISTS "ck_item_venda_desconto_nao_excede_bruto"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT IF EXISTS "ck_item_venda_valor_total_consistente"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP COLUMN IF EXISTS "desconto"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "ck_item_venda_valor_total_consistente"
      CHECK ("valor_total" = ("quantidade" * "valor_unitario"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT IF EXISTS "ck_item_venda_valor_total_consistente"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD COLUMN "desconto" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "ck_item_venda_desconto_nao_negativo"
      CHECK ("desconto" >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "ck_item_venda_desconto_nao_excede_bruto"
      CHECK ("desconto" <= ("quantidade" * "valor_unitario"))
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "ck_item_venda_valor_total_consistente"
      CHECK ("valor_total" = (("quantidade" * "valor_unitario") - "desconto"))
    `);
  }
}
