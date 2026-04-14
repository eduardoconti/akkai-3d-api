import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxaMeioPagamentoCarteira1776100000000
  implements MigrationInterface
{
  name = 'AddTaxaMeioPagamentoCarteira1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."meio_pagamento_taxa_meio_pagamento_carteira_enum" AS ENUM('DIN', 'DEB', 'CRE', 'PIX')`,
    );
    await queryRunner.query(`
      CREATE TABLE "taxa_meio_pagamento_carteira" (
        "id" SERIAL NOT NULL,
        "id_usuario_inclusao" integer NOT NULL,
        "id_carteira" integer NOT NULL,
        "meio_pagamento" "public"."meio_pagamento_taxa_meio_pagamento_carteira_enum" NOT NULL,
        "percentual" numeric(5,2) NOT NULL,
        "ativa" boolean NOT NULL DEFAULT true,
        CONSTRAINT "ck_taxa_meio_pagamento_carteira_percentual_nao_negativo" CHECK ("percentual" >= 0),
        CONSTRAINT "ck_taxa_meio_pagamento_carteira_percentual_maximo" CHECK ("percentual" <= 100),
        CONSTRAINT "uk_taxa_meio_pagamento_carteira_carteira_pagamento" UNIQUE ("id_carteira", "meio_pagamento"),
        CONSTRAINT "pk_taxa_meio_pagamento_carteira" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_taxa_meio_pagamento_carteira_id_carteira" ON "taxa_meio_pagamento_carteira" ("id_carteira")`,
    );
    await queryRunner.query(`
      ALTER TABLE "taxa_meio_pagamento_carteira"
      ADD CONSTRAINT "fk_taxa_meio_pagamento_carteira_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "taxa_meio_pagamento_carteira"
      ADD CONSTRAINT "fk_taxa_meio_pagamento_carteira_usuario_inclusao"
      FOREIGN KEY ("id_usuario_inclusao")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "taxa_meio_pagamento_carteira" DROP CONSTRAINT "fk_taxa_meio_pagamento_carteira_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "taxa_meio_pagamento_carteira" DROP CONSTRAINT "fk_taxa_meio_pagamento_carteira_carteira"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_taxa_meio_pagamento_carteira_id_carteira"`,
    );
    await queryRunner.query(`DROP TABLE "taxa_meio_pagamento_carteira"`);
    await queryRunner.query(
      `DROP TYPE "public"."meio_pagamento_taxa_meio_pagamento_carteira_enum"`,
    );
  }
}
