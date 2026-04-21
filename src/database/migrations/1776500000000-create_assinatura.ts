import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAssinatura1776500000000 implements MigrationInterface {
  name = 'CreateAssinatura1776500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plano_assinatura" (
        "id" SERIAL NOT NULL,
        "nome" character varying(120) NOT NULL,
        "descricao" text,
        "valor" integer NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ck_plano_assinatura_valor_positivo" CHECK ("valor" > 0),
        CONSTRAINT "uk_plano_assinatura_nome" UNIQUE ("nome"),
        CONSTRAINT "pk_plano_assinatura" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "status_assinante_enum" AS ENUM ('ATIVO', 'PAUSADO', 'CANCELADO')`,
    );

    await queryRunner.query(
      `CREATE TABLE "assinante" (
        "id" SERIAL NOT NULL,
        "nome" character varying(120) NOT NULL,
        "email" character varying(120),
        "telefone" character varying(30),
        "endereco_entrega" character varying(500),
        "status" "status_assinante_enum" NOT NULL DEFAULT 'ATIVO',
        "id_plano" integer NOT NULL,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_assinante" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_assinante_id_plano" ON "assinante" ("id_plano")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_assinante_status" ON "assinante" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "assinante" ADD CONSTRAINT "fk_assinante_plano_assinatura" FOREIGN KEY ("id_plano") REFERENCES "plano_assinatura"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TYPE "status_ciclo_enum" AS ENUM ('PENDENTE', 'EM_PREPARO', 'ENVIADO', 'ENTREGUE', 'CANCELADO')`,
    );

    await queryRunner.query(
      `CREATE TABLE "ciclo_assinatura" (
        "id" SERIAL NOT NULL,
        "id_assinante" integer NOT NULL,
        "mes_referencia" integer NOT NULL,
        "ano_referencia" integer NOT NULL,
        "status" "status_ciclo_enum" NOT NULL DEFAULT 'PENDENTE',
        "codigo_rastreio" character varying(60),
        "data_envio" TIMESTAMP,
        "observacao" text,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uk_ciclo_assinante_mes_ano" UNIQUE ("id_assinante", "mes_referencia", "ano_referencia"),
        CONSTRAINT "pk_ciclo_assinatura" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_ciclo_assinatura_id_assinante" ON "ciclo_assinatura" ("id_assinante")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ciclo_assinatura_status" ON "ciclo_assinatura" ("status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ciclo_assinatura" ADD CONSTRAINT "fk_ciclo_assinatura_assinante" FOREIGN KEY ("id_assinante") REFERENCES "assinante"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "item_ciclo_assinatura" (
        "id" SERIAL NOT NULL,
        "id_ciclo" integer NOT NULL,
        "nome_produto" character varying(120) NOT NULL,
        "quantidade" integer NOT NULL,
        "observacao" text,
        CONSTRAINT "ck_item_ciclo_quantidade_positiva" CHECK ("quantidade" > 0),
        CONSTRAINT "uk_item_ciclo_produto" UNIQUE ("id_ciclo", "nome_produto"),
        CONSTRAINT "pk_item_ciclo_assinatura" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" ADD CONSTRAINT "fk_item_ciclo_assinatura_ciclo" FOREIGN KEY ("id_ciclo") REFERENCES "ciclo_assinatura"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_ciclo_assinatura" DROP CONSTRAINT "fk_item_ciclo_assinatura_ciclo"`,
    );
    await queryRunner.query(`DROP TABLE "item_ciclo_assinatura"`);

    await queryRunner.query(
      `ALTER TABLE "ciclo_assinatura" DROP CONSTRAINT "fk_ciclo_assinatura_assinante"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_ciclo_assinatura_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_ciclo_assinatura_id_assinante"`,
    );
    await queryRunner.query(`DROP TABLE "ciclo_assinatura"`);
    await queryRunner.query(`DROP TYPE "status_ciclo_enum"`);

    await queryRunner.query(
      `ALTER TABLE "assinante" DROP CONSTRAINT "fk_assinante_plano_assinatura"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_assinante_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_assinante_id_plano"`);
    await queryRunner.query(`DROP TABLE "assinante"`);
    await queryRunner.query(`DROP TYPE "status_assinante_enum"`);

    await queryRunner.query(`DROP TABLE "plano_assinatura"`);
  }
}
