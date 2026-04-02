import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrindeToItemVenda1775200000000 implements MigrationInterface {
  name = 'AddBrindeToItemVenda1775200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD COLUMN "brinde" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT "uk_item_venda_venda_produto"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "uk_item_venda_venda_produto_brinde"
      UNIQUE ("id_venda", "id_produto", "brinde")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP CONSTRAINT "uk_item_venda_venda_produto_brinde"
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      ADD CONSTRAINT "uk_item_venda_venda_produto"
      UNIQUE ("id_venda", "id_produto")
    `);

    await queryRunner.query(`
      ALTER TABLE "item_venda"
      DROP COLUMN "brinde"
    `);
  }
}
