import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePagamentoVenda1777200000000 implements MigrationInterface {
  name = 'CreatePagamentoVenda1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."meio_pagamento_pagamento_venda_enum" AS ENUM(
        'DIN',
        'DEB',
        'CRE',
        'PIX'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pagamento_venda" (
        "id" SERIAL NOT NULL,
        "id_venda" integer NOT NULL,
        "id_carteira" integer NOT NULL,
        "meio_pagamento" "public"."meio_pagamento_pagamento_venda_enum" NOT NULL,
        "valor" integer NOT NULL,
        "percentual_taxa" numeric(5,2),
        "valor_taxa" integer,
        "percentual_imposto" numeric(5,2),
        "valor_imposto" integer,
        CONSTRAINT "ck_pagamento_venda_valor_imposto_nao_negativo" CHECK ("valor_imposto" >= 0),
        CONSTRAINT "ck_pagamento_venda_valor_taxa_nao_negativo" CHECK ("valor_taxa" >= 0),
        CONSTRAINT "ck_pagamento_venda_valor_nao_negativo" CHECK ("valor" >= 0),
        CONSTRAINT "pk_pagamento_venda" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "pagamento_venda" (
        "id_venda",
        "id_carteira",
        "meio_pagamento",
        "valor",
        "percentual_taxa",
        "valor_taxa",
        "percentual_imposto",
        "valor_imposto"
      )
      SELECT
        "id",
        "id_carteira",
        "meio_pagamento"::text::"public"."meio_pagamento_pagamento_venda_enum",
        "valor_total",
        "percentual_taxa",
        "valor_taxa",
        "percentual_imposto",
        "valor_imposto"
      FROM "venda"
      WHERE "id_carteira" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "pagamento_venda"
      ADD CONSTRAINT "fk_pagamento_venda_venda"
      FOREIGN KEY ("id_venda")
      REFERENCES "venda"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "pagamento_venda"
      ADD CONSTRAINT "fk_pagamento_venda_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_pagamento_venda_id_venda" ON "pagamento_venda" ("id_venda")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pagamento_venda_id_carteira" ON "pagamento_venda" ("id_carteira")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pagamento_venda_meio_pagamento" ON "pagamento_venda" ("meio_pagamento")`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_venda_id_carteira"`);
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT IF EXISTS "fk_venda_carteira"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "id_carteira"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "meio_pagamento"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "percentual_taxa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "valor_taxa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "percentual_imposto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN IF EXISTS "valor_imposto"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."meio_pagamento_venda_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."meio_pagamento_venda_enum" AS ENUM(
        'DIN',
        'DEB',
        'CRE',
        'PIX'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "venda"
      ADD "meio_pagamento" "public"."meio_pagamento_venda_enum" NOT NULL DEFAULT 'DIN'
    `);
    await queryRunner.query(`ALTER TABLE "venda" ADD "id_carteira" integer`);
    await queryRunner.query(
      `ALTER TABLE "venda" ADD "percentual_taxa" numeric(5,2)`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "valor_taxa" integer`);
    await queryRunner.query(
      `ALTER TABLE "venda" ADD "percentual_imposto" numeric(5,2)`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "valor_imposto" integer`);

    await queryRunner.query(`
      UPDATE "venda"
      SET
        "id_carteira" = pagamento."id_carteira",
        "meio_pagamento" = pagamento."meio_pagamento"::text::"public"."meio_pagamento_venda_enum",
        "percentual_taxa" = pagamento."percentual_taxa",
        "valor_taxa" = pagamento."valor_taxa",
        "percentual_imposto" = pagamento."percentual_imposto",
        "valor_imposto" = pagamento."valor_imposto"
      FROM (
        SELECT DISTINCT ON ("id_venda")
          "id_venda",
          "id_carteira",
          "meio_pagamento",
          "percentual_taxa",
          "valor_taxa",
          "percentual_imposto",
          "valor_imposto"
        FROM "pagamento_venda"
        ORDER BY "id_venda", "id"
      ) pagamento
      WHERE pagamento."id_venda" = "venda"."id"
    `);

    await queryRunner.query(
      `ALTER TABLE "venda" ALTER COLUMN "meio_pagamento" DROP DEFAULT`,
    );
    await queryRunner.query(`
      ALTER TABLE "venda"
      ADD CONSTRAINT "fk_venda_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_carteira" ON "venda" ("id_carteira")`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."idx_pagamento_venda_meio_pagamento"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pagamento_venda_id_carteira"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pagamento_venda_id_venda"`,
    );
    await queryRunner.query(`DROP TABLE "pagamento_venda"`);
    await queryRunner.query(
      `DROP TYPE "public"."meio_pagamento_pagamento_venda_enum"`,
    );
  }
}
