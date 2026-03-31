import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowCustomSaleItems1774922382464 implements MigrationInterface {
  name = 'AllowCustomSaleItems1774922382464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD "nome_produto" character varying(120)`,
    );
    await queryRunner.query(`
            UPDATE "item_venda" AS "iv"
            SET "nome_produto" = "p"."nome"
            FROM "produto" AS "p"
            WHERE "iv"."id_produto" = "p"."id"
        `);
    await queryRunner.query(
      `ALTER TABLE "item_venda" ALTER COLUMN "nome_produto" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "fk_item_venda_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "uk_item_venda_venda_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ALTER COLUMN "id_produto" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "uk_item_venda_venda_produto" UNIQUE ("id_venda", "id_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "fk_item_venda_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "fk_item_venda_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "uk_item_venda_venda_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ALTER COLUMN "id_produto" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "uk_item_venda_venda_produto" UNIQUE ("id_venda", "id_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "fk_item_venda_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP COLUMN "nome_produto"`,
    );
  }
}
