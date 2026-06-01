import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkConsignacaoToVenda1777400000000 implements MigrationInterface {
  name = 'LinkConsignacaoToVenda1777400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."tipo_venda_enum" ADD VALUE IF NOT EXISTS 'CONSIGNACAO'`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" ADD "valor_unitario" integer`,
    );
    await queryRunner.query(`
      UPDATE "item_consignacao" item
      SET "valor_unitario" = produto."valor"
      FROM "produto" produto
      WHERE produto."id" = item."id_produto"
    `);
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" ALTER COLUMN "valor_unitario" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" ADD CONSTRAINT "ck_item_consignacao_valor_unitario_nao_negativo" CHECK ("valor_unitario" >= 0)`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "id_consignacao" integer`);
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_consignacao" ON "venda" ("id_consignacao")`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_consignacao" FOREIGN KEY ("id_consignacao") REFERENCES "consignacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_consignacao"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_venda_id_consignacao"`);
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "id_consignacao"`);
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" DROP COLUMN "valor_unitario"`,
    );
    await queryRunner.query(
      `UPDATE "venda" SET "tipo" = 'LOJA' WHERE "tipo" = 'CONSIGNACAO'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."tipo_venda_enum" RENAME TO "tipo_venda_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tipo_venda_enum" AS ENUM('FEIRA', 'LOJA', 'ONLINE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" ALTER COLUMN "tipo" TYPE "public"."tipo_venda_enum" USING "tipo"::text::"public"."tipo_venda_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tipo_venda_enum_old"`);
  }
}
