import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConsignacao1777300000000 implements MigrationInterface {
  name = 'CreateConsignacao1777300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."origem_movimentacao_estoque_enum" ADD VALUE IF NOT EXISTS 'CONSIGNACAO'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_revendedor_enum" AS ENUM('ATIVO', 'INATIVO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_consignacao_enum" AS ENUM('ABERTA', 'FECHADA', 'CANCELADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "revendedor" ("id" SERIAL NOT NULL, "nome" character varying(120) NOT NULL, "telefone" character varying(30) NOT NULL, "status" "public"."status_revendedor_enum" NOT NULL DEFAULT 'ATIVO', "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "ck_revendedor_nome_nao_vazio" CHECK (char_length(trim("nome")) > 0), CONSTRAINT "ck_revendedor_telefone_nao_vazio" CHECK (char_length(trim("telefone")) > 0), CONSTRAINT "pk_revendedor" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "consignacao" ("id" SERIAL NOT NULL, "id_revendedor" integer NOT NULL, "status" "public"."status_consignacao_enum" NOT NULL DEFAULT 'ABERTA', "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(), "id_usuario_inclusao" integer NOT NULL, CONSTRAINT "pk_consignacao" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_consignacao" ("id" SERIAL NOT NULL, "id_consignacao" integer NOT NULL, "id_produto" integer NOT NULL, "quantidade_enviada" integer NOT NULL, "quantidade_vendida" integer NOT NULL DEFAULT '0', "quantidade_devolvida" integer NOT NULL DEFAULT '0', CONSTRAINT "uk_item_consignacao_consignacao_produto" UNIQUE ("id_consignacao", "id_produto"), CONSTRAINT "ck_item_consignacao_quantidade_enviada_positiva" CHECK ("quantidade_enviada" > 0), CONSTRAINT "ck_item_consignacao_quantidade_vendida_nao_negativa" CHECK ("quantidade_vendida" >= 0), CONSTRAINT "ck_item_consignacao_quantidade_devolvida_nao_negativa" CHECK ("quantidade_devolvida" >= 0), CONSTRAINT "ck_item_consignacao_quantidades_movimentadas_validas" CHECK ("quantidade_vendida" + "quantidade_devolvida" <= "quantidade_enviada"), CONSTRAINT "pk_item_consignacao" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_revendedor_status" ON "revendedor" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_consignacao_id_revendedor" ON "consignacao" ("id_revendedor")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_consignacao_status" ON "consignacao" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_item_consignacao_id_consignacao" ON "item_consignacao" ("id_consignacao")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_item_consignacao_id_produto" ON "item_consignacao" ("id_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "consignacao" ADD CONSTRAINT "fk_consignacao_revendedor" FOREIGN KEY ("id_revendedor") REFERENCES "revendedor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consignacao" ADD CONSTRAINT "fk_consignacao_usuario_inclusao" FOREIGN KEY ("id_usuario_inclusao") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" ADD CONSTRAINT "fk_item_consignacao_consignacao" FOREIGN KEY ("id_consignacao") REFERENCES "consignacao"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" ADD CONSTRAINT "fk_item_consignacao_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" DROP CONSTRAINT "fk_item_consignacao_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_consignacao" DROP CONSTRAINT "fk_item_consignacao_consignacao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consignacao" DROP CONSTRAINT "fk_consignacao_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consignacao" DROP CONSTRAINT "fk_consignacao_revendedor"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_item_consignacao_id_produto"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_item_consignacao_id_consignacao"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_consignacao_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_consignacao_id_revendedor"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_revendedor_status"`);
    await queryRunner.query(`DROP TABLE "item_consignacao"`);
    await queryRunner.query(`DROP TABLE "consignacao"`);
    await queryRunner.query(`DROP TABLE "revendedor"`);
    await queryRunner.query(`DROP TYPE "public"."status_consignacao_enum"`);
    await queryRunner.query(`DROP TYPE "public"."status_revendedor_enum"`);
    await queryRunner.query(
      `UPDATE "movimentacao_estoque" SET "origem" = 'AJUSTE' WHERE "origem" = 'CONSIGNACAO'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."origem_movimentacao_estoque_enum" RENAME TO "origem_movimentacao_estoque_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."origem_movimentacao_estoque_enum" AS ENUM('COMPRA', 'VENDA', 'AJUSTE', 'PERDA', 'PRODUCAO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ALTER COLUMN "origem" TYPE "public"."origem_movimentacao_estoque_enum" USING "origem"::text::"public"."origem_movimentacao_estoque_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."origem_movimentacao_estoque_enum_old"`,
    );
  }
}
