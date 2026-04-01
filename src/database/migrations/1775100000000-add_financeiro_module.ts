import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFinanceiroModule1775100000000 implements MigrationInterface {
  name = 'AddFinanceiroModule1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."categoria_despesa_enum" AS ENUM(
        'DESPESA_FIXA',
        'MATERIA_PRIMA',
        'EMBALAGEM',
        'EVENTO',
        'TRANSPORTE',
        'OUTROS'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."meio_pagamento_despesa_enum" AS ENUM(
        'DIN',
        'DEB',
        'CRE',
        'PIX'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "carteira" (
        "id" SERIAL NOT NULL,
        "nome" character varying(120) NOT NULL,
        "ativa" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_carteira_nome" UNIQUE ("nome"),
        CONSTRAINT "pk_carteira" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "despesa" (
        "id" SERIAL NOT NULL,
        "data_lancamento" TIMESTAMP NOT NULL DEFAULT now(),
        "descricao" character varying(255) NOT NULL,
        "valor" integer NOT NULL,
        "categoria" "public"."categoria_despesa_enum" NOT NULL,
        "meio_pagamento" "public"."meio_pagamento_despesa_enum" NOT NULL,
        "observacao" character varying(500),
        "id_carteira" integer NOT NULL,
        CONSTRAINT "ck_despesa_valor_nao_negativo" CHECK ("valor" >= 0),
        CONSTRAINT "pk_despesa" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "venda"
      ADD COLUMN "id_carteira" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "despesa"
      ADD CONSTRAINT "fk_despesa_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "venda"
      ADD CONSTRAINT "fk_venda_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_carteira"`,
    );
    await queryRunner.query(
      `ALTER TABLE "despesa" DROP CONSTRAINT "fk_despesa_carteira"`,
    );
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "id_carteira"`);
    await queryRunner.query(`DROP TABLE "despesa"`);
    await queryRunner.query(`DROP TABLE "carteira"`);
    await queryRunner.query(`DROP TYPE "public"."meio_pagamento_despesa_enum"`);
    await queryRunner.query(`DROP TYPE "public"."categoria_despesa_enum"`);
  }
}
