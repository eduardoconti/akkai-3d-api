import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1774747635841 implements MigrationInterface {
    name = 'InitSchema1774747635841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categoria_produto" ("id" SERIAL NOT NULL, "nome" character varying(80) NOT NULL, "id_ascendente" integer, CONSTRAINT "ck_categoria_produto_sem_auto_relacao" CHECK ("id_ascendente" IS NULL OR "id_ascendente" <> "id"), CONSTRAINT "pk_categoria_produto" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tipo_movimentacao_estoque_enum" AS ENUM('E', 'S')`);
        await queryRunner.query(`CREATE TYPE "public"."origem_movimentacao_estoque_enum" AS ENUM('COMPRA', 'VENDA', 'AJUSTE', 'PERDA', 'PRODUCAO')`);
        await queryRunner.query(`CREATE TABLE "movimentacao_estoque" ("id" SERIAL NOT NULL, "id_produto" integer NOT NULL, "quantidade" integer NOT NULL, "tipo" "public"."tipo_movimentacao_estoque_enum" NOT NULL, "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(), "origem" "public"."origem_movimentacao_estoque_enum" NOT NULL, CONSTRAINT "ck_movimentacao_estoque_quantidade_positiva" CHECK ("quantidade" > 0), CONSTRAINT "pk_movimentacao_estoque" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item_venda" ("id" SERIAL NOT NULL, "id_venda" integer NOT NULL, "id_produto" integer NOT NULL, "quantidade" integer NOT NULL, "valor_unitario" integer NOT NULL, "valor_total" integer NOT NULL, "desconto" integer NOT NULL DEFAULT '0', CONSTRAINT "uk_item_venda_venda_produto" UNIQUE ("id_venda", "id_produto"), CONSTRAINT "ck_item_venda_valor_total_consistente" CHECK ("valor_total" = (("quantidade" * "valor_unitario") - "desconto")), CONSTRAINT "ck_item_venda_desconto_nao_excede_bruto" CHECK ("desconto" <= ("quantidade" * "valor_unitario")), CONSTRAINT "ck_item_venda_desconto_nao_negativo" CHECK ("desconto" >= 0), CONSTRAINT "ck_item_venda_valor_unitario_nao_negativo" CHECK ("valor_unitario" >= 0), CONSTRAINT "ck_item_venda_quantidade_positiva" CHECK ("quantidade" > 0), CONSTRAINT "pk_item_venda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tipo_venda_enum" AS ENUM('FEIRA', 'LOJA', 'ONLINE')`);
        await queryRunner.query(`CREATE TYPE "public"."meio_pagamento_venda_enum" AS ENUM('DIN', 'DEB', 'CRE', 'PIX')`);
        await queryRunner.query(`CREATE TABLE "venda" ("id" SERIAL NOT NULL, "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(), "valor_total" integer NOT NULL, "tipo" "public"."tipo_venda_enum" NOT NULL, "meio_pagamento" "public"."meio_pagamento_venda_enum" NOT NULL, "desconto" integer NOT NULL DEFAULT '0', CONSTRAINT "ck_venda_valor_total_nao_negativo" CHECK ("valor_total" >= 0), CONSTRAINT "ck_venda_desconto_nao_negativo" CHECK ("desconto" >= 0), CONSTRAINT "pk_venda" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "produto" ("id" SERIAL NOT NULL, "nome" character varying(120) NOT NULL, "codigo" character varying(40) NOT NULL, "descricao" character varying(500), "estoque_minimo" integer, "id_categoria" integer NOT NULL, "valor" integer NOT NULL, CONSTRAINT "uk_produto_codigo" UNIQUE ("codigo"), CONSTRAINT "ck_produto_estoque_minimo_nao_negativo" CHECK ("estoque_minimo" IS NULL OR "estoque_minimo" >= 0), CONSTRAINT "ck_produto_valor_nao_negativo" CHECK ("valor" >= 0), CONSTRAINT "pk_produto" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categoria_produto" ADD CONSTRAINT "fk_categoria_produto_categoria_pai" FOREIGN KEY ("id_ascendente") REFERENCES "categoria_produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "fk_movimentacao_estoque_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_venda" ADD CONSTRAINT "fk_item_venda_venda" FOREIGN KEY ("id_venda") REFERENCES "venda"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_venda" ADD CONSTRAINT "fk_item_venda_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "produto" ADD CONSTRAINT "fk_produto_categoria_produto" FOREIGN KEY ("id_categoria") REFERENCES "categoria_produto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "produto" DROP CONSTRAINT "fk_produto_categoria_produto"`);
        await queryRunner.query(`ALTER TABLE "item_venda" DROP CONSTRAINT "fk_item_venda_produto"`);
        await queryRunner.query(`ALTER TABLE "item_venda" DROP CONSTRAINT "fk_item_venda_venda"`);
        await queryRunner.query(`ALTER TABLE "movimentacao_estoque" DROP CONSTRAINT "fk_movimentacao_estoque_produto"`);
        await queryRunner.query(`ALTER TABLE "categoria_produto" DROP CONSTRAINT "fk_categoria_produto_categoria_pai"`);
        await queryRunner.query(`DROP TABLE "produto"`);
        await queryRunner.query(`DROP TABLE "venda"`);
        await queryRunner.query(`DROP TYPE "public"."meio_pagamento_venda_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tipo_venda_enum"`);
        await queryRunner.query(`DROP TABLE "item_venda"`);
        await queryRunner.query(`DROP TABLE "movimentacao_estoque"`);
        await queryRunner.query(`DROP TYPE "public"."origem_movimentacao_estoque_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tipo_movimentacao_estoque_enum"`);
        await queryRunner.query(`DROP TABLE "categoria_produto"`);
    }

}
