import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrocaDevolucao1778700000000 implements MigrationInterface {
  name = 'CreateTrocaDevolucao1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."origem_movimentacao_estoque_enum"
      ADD VALUE IF NOT EXISTS 'DEVOLUCAO'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."origem_movimentacao_estoque_enum"
      ADD VALUE IF NOT EXISTS 'TROCA'
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tipo_diferenca_troca_devolucao_enum"
      AS ENUM('A_PAGAR', 'A_DEVOLVER', 'SEM_DIFERENCA')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."meio_pagamento_troca_devolucao_enum"
      AS ENUM('DIN', 'DEB', 'CRE', 'PIX')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tipo_item_troca_devolucao_enum"
      AS ENUM('DEVOLVIDO', 'ENTREGUE')
    `);
    await queryRunner.query(`
      CREATE TABLE "troca_devolucao" (
        "id" SERIAL NOT NULL,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(),
        "data_troca_devolucao" TIMESTAMP NOT NULL,
        "valor_devolvido" integer NOT NULL,
        "valor_novo" integer NOT NULL,
        "valor_diferenca" integer NOT NULL,
        "tipo_diferenca" "public"."tipo_diferenca_troca_devolucao_enum" NOT NULL,
        "id_carteira" integer,
        "meio_pagamento" "public"."meio_pagamento_troca_devolucao_enum",
        "observacao" character varying(500),
        "id_usuario_inclusao" integer NOT NULL,
        CONSTRAINT "ck_troca_devolucao_valor_devolvido_nao_negativo" CHECK ("valor_devolvido" >= 0),
        CONSTRAINT "ck_troca_devolucao_valor_novo_nao_negativo" CHECK ("valor_novo" >= 0),
        CONSTRAINT "ck_troca_devolucao_valor_diferenca_nao_negativo" CHECK ("valor_diferenca" >= 0),
        CONSTRAINT "pk_troca_devolucao" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "item_troca_devolucao" (
        "id" SERIAL NOT NULL,
        "id_troca_devolucao" integer NOT NULL,
        "id_produto" integer NOT NULL,
        "tipo" "public"."tipo_item_troca_devolucao_enum" NOT NULL,
        "quantidade" integer NOT NULL,
        "valor_unitario" integer NOT NULL,
        "valor_total" integer NOT NULL,
        CONSTRAINT "ck_item_troca_devolucao_quantidade_positiva" CHECK ("quantidade" > 0),
        CONSTRAINT "ck_item_troca_devolucao_valor_unitario_nao_negativo" CHECK ("valor_unitario" >= 0),
        CONSTRAINT "ck_item_troca_devolucao_valor_total_consistente" CHECK ("valor_total" = ("quantidade" * "valor_unitario")),
        CONSTRAINT "pk_item_troca_devolucao" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_troca_devolucao_data" ON "troca_devolucao" ("data_troca_devolucao")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_troca_devolucao_id_carteira" ON "troca_devolucao" ("id_carteira")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_item_troca_devolucao_id_troca_devolucao" ON "item_troca_devolucao" ("id_troca_devolucao")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_item_troca_devolucao_id_produto" ON "item_troca_devolucao" ("id_produto")`,
    );
    await queryRunner.query(`
      ALTER TABLE "troca_devolucao"
      ADD CONSTRAINT "fk_troca_devolucao_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "troca_devolucao"
      ADD CONSTRAINT "fk_troca_devolucao_usuario_inclusao"
      FOREIGN KEY ("id_usuario_inclusao")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "item_troca_devolucao"
      ADD CONSTRAINT "fk_item_troca_devolucao_troca_devolucao"
      FOREIGN KEY ("id_troca_devolucao")
      REFERENCES "troca_devolucao"("id")
      ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "item_troca_devolucao"
      ADD CONSTRAINT "fk_item_troca_devolucao_produto"
      FOREIGN KEY ("id_produto")
      REFERENCES "produto"("id")
      ON DELETE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_troca_devolucao" DROP CONSTRAINT "fk_item_troca_devolucao_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_troca_devolucao" DROP CONSTRAINT "fk_item_troca_devolucao_troca_devolucao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "troca_devolucao" DROP CONSTRAINT "fk_troca_devolucao_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "troca_devolucao" DROP CONSTRAINT "fk_troca_devolucao_carteira"`,
    );
    await queryRunner.query(`DROP INDEX "idx_item_troca_devolucao_id_produto"`);
    await queryRunner.query(
      `DROP INDEX "idx_item_troca_devolucao_id_troca_devolucao"`,
    );
    await queryRunner.query(`DROP INDEX "idx_troca_devolucao_id_carteira"`);
    await queryRunner.query(`DROP INDEX "idx_troca_devolucao_data"`);
    await queryRunner.query(`DROP TABLE "item_troca_devolucao"`);
    await queryRunner.query(`DROP TABLE "troca_devolucao"`);
    await queryRunner.query(
      `DROP TYPE "public"."tipo_item_troca_devolucao_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."meio_pagamento_troca_devolucao_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."tipo_diferenca_troca_devolucao_enum"`,
    );
    await queryRunner.query(`
      DELETE FROM "movimentacao_estoque"
      WHERE "origem" IN ('DEVOLUCAO', 'TROCA')
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."origem_movimentacao_estoque_enum"
      RENAME TO "origem_movimentacao_estoque_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."origem_movimentacao_estoque_enum"
      AS ENUM('COMPRA', 'VENDA', 'AJUSTE', 'PERDA', 'PRODUCAO', 'CONSIGNACAO')
    `);
    await queryRunner.query(`
      ALTER TABLE "movimentacao_estoque"
      ALTER COLUMN "origem" TYPE "public"."origem_movimentacao_estoque_enum"
      USING "origem"::text::"public"."origem_movimentacao_estoque_enum"
    `);
    await queryRunner.query(
      `DROP TYPE "public"."origem_movimentacao_estoque_enum_old"`,
    );
  }
}
