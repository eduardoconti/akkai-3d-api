import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkAssinaturaItemsToProduto1776796445000
  implements MigrationInterface
{
  name = 'LinkAssinaturaItemsToProduto1776796445000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP CONSTRAINT "uk_item_ciclo_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP CONSTRAINT "uk_item_kit_mensal_produto"`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD COLUMN "id_produto" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD COLUMN "id_produto" integer`,
    );

    await queryRunner.query(`
      UPDATE "item_ciclo_assinatura" AS "item"
      SET "id_produto" = "produto"."id"
      FROM "produto" AS "produto"
      WHERE "produto"."nome" = "item"."nome_produto"
    `);
    await queryRunner.query(`
      UPDATE "item_kit_mensal" AS "item"
      SET "id_produto" = "produto"."id"
      FROM "produto" AS "produto"
      WHERE "produto"."nome" = "item"."nome_produto"
    `);

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ALTER COLUMN "id_produto" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ALTER COLUMN "id_produto" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP COLUMN "nome_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP COLUMN "nome_produto"`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD CONSTRAINT "uk_item_ciclo_produto" UNIQUE ("id_ciclo", "id_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD CONSTRAINT "uk_item_kit_mensal_produto" UNIQUE ("id_kit", "id_produto")`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD CONSTRAINT "fk_item_ciclo_assinatura_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD CONSTRAINT "fk_item_kit_mensal_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP CONSTRAINT "fk_item_kit_mensal_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP CONSTRAINT "fk_item_ciclo_assinatura_produto"`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP CONSTRAINT "uk_item_kit_mensal_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP CONSTRAINT "uk_item_ciclo_produto"`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD COLUMN "nome_produto" character varying(120)`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD COLUMN "nome_produto" character varying(120)`,
    );

    await queryRunner.query(`
      UPDATE "item_kit_mensal" AS "item"
      SET "nome_produto" = "produto"."nome"
      FROM "produto" AS "produto"
      WHERE "produto"."id" = "item"."id_produto"
    `);
    await queryRunner.query(`
      UPDATE "item_ciclo_assinatura" AS "item"
      SET "nome_produto" = "produto"."nome"
      FROM "produto" AS "produto"
      WHERE "produto"."id" = "item"."id_produto"
    `);

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ALTER COLUMN "nome_produto" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ALTER COLUMN "nome_produto" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP COLUMN "id_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP COLUMN "id_produto"`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD CONSTRAINT "uk_item_kit_mensal_produto" UNIQUE ("id_kit", "nome_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD CONSTRAINT "uk_item_ciclo_produto" UNIQUE ("id_ciclo", "nome_produto")`,
    );
  }
}
