import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKitMensal1776600000000 implements MigrationInterface {
  name = 'AddKitMensal1776600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "kit_mensal" (
        "id" SERIAL NOT NULL,
        "id_plano" integer NOT NULL,
        "mes_referencia" integer NOT NULL,
        "ano_referencia" integer NOT NULL,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uk_kit_mensal_plano_mes_ano" UNIQUE ("id_plano", "mes_referencia", "ano_referencia"),
        CONSTRAINT "pk_kit_mensal" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_kit_mensal_id_plano" ON "kit_mensal" ("id_plano")`,
    );

    await queryRunner.query(
      `ALTER TABLE "kit_mensal" ADD CONSTRAINT "fk_kit_mensal_plano_assinatura" FOREIGN KEY ("id_plano") REFERENCES "plano_assinatura"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "item_kit_mensal" (
        "id" SERIAL NOT NULL,
        "id_kit" integer NOT NULL,
        "nome_produto" character varying(120) NOT NULL,
        "quantidade" integer NOT NULL,
        "observacao" text,
        CONSTRAINT "ck_item_kit_mensal_quantidade_positiva" CHECK ("quantidade" > 0),
        CONSTRAINT "uk_item_kit_mensal_produto" UNIQUE ("id_kit", "nome_produto"),
        CONSTRAINT "pk_item_kit_mensal" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" ADD CONSTRAINT "fk_item_kit_mensal_kit" FOREIGN KEY ("id_kit") REFERENCES "kit_mensal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_kit_mensal" DROP CONSTRAINT "fk_item_kit_mensal_kit"`,
    );
    await queryRunner.query(`DROP TABLE "item_kit_mensal"`);

    await queryRunner.query(
      `ALTER TABLE "kit_mensal" DROP CONSTRAINT "fk_kit_mensal_plano_assinatura"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_kit_mensal_id_plano"`);
    await queryRunner.query(`DROP TABLE "kit_mensal"`);
  }
}
