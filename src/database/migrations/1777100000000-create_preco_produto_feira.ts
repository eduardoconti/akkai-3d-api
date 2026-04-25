import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrecoProdutoFeira1777100000000
  implements MigrationInterface
{
  name = 'CreatePrecoProdutoFeira1777100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "preco_produto_feira" ("id" SERIAL NOT NULL, "id_feira" integer NOT NULL, "id_produto" integer NOT NULL, "valor" integer NOT NULL, CONSTRAINT "ck_preco_produto_feira_valor_minimo" CHECK ("valor" >= 50), CONSTRAINT "uk_preco_produto_feira_feira_produto" UNIQUE ("id_feira", "id_produto"), CONSTRAINT "pk_preco_produto_feira" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_preco_produto_feira_id_feira" ON "preco_produto_feira" ("id_feira")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_preco_produto_feira_id_produto" ON "preco_produto_feira" ("id_produto")`,
    );
    await queryRunner.query(
      `ALTER TABLE "preco_produto_feira" ADD CONSTRAINT "fk_preco_produto_feira_feira" FOREIGN KEY ("id_feira") REFERENCES "feira"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "preco_produto_feira" ADD CONSTRAINT "fk_preco_produto_feira_produto" FOREIGN KEY ("id_produto") REFERENCES "produto"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "preco_produto_feira" DROP CONSTRAINT "fk_preco_produto_feira_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "preco_produto_feira" DROP CONSTRAINT "fk_preco_produto_feira_feira"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_preco_produto_feira_id_produto"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_preco_produto_feira_id_feira"`,
    );
    await queryRunner.query(`DROP TABLE "preco_produto_feira"`);
  }
}
