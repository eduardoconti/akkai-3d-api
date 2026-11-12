import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemOrcamento1788100000000 implements MigrationInterface {
  name = 'CreateItemOrcamento1788100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "item_orcamento" (
        "id" SERIAL NOT NULL,
        "id_orcamento" integer NOT NULL,
        "id_produto" integer NOT NULL,
        "nome_produto" character varying(120) NOT NULL,
        "quantidade" integer NOT NULL,
        CONSTRAINT "ck_item_orcamento_quantidade_positiva" CHECK ("quantidade" > 0),
        CONSTRAINT "uk_item_orcamento_orcamento_produto" UNIQUE ("id_orcamento", "id_produto"),
        CONSTRAINT "pk_item_orcamento" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_item_orcamento_id_orcamento"
      ON "item_orcamento" ("id_orcamento")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_item_orcamento_id_produto"
      ON "item_orcamento" ("id_produto")
    `);
    await queryRunner.query(`
      ALTER TABLE "item_orcamento"
      ADD CONSTRAINT "fk_item_orcamento_orcamento"
      FOREIGN KEY ("id_orcamento") REFERENCES "orcamento"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "item_orcamento"
      ADD CONSTRAINT "fk_item_orcamento_produto"
      FOREIGN KEY ("id_produto") REFERENCES "produto"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_orcamento" DROP CONSTRAINT "fk_item_orcamento_produto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_orcamento" DROP CONSTRAINT "fk_item_orcamento_orcamento"`,
    );
    await queryRunner.query(`DROP INDEX "idx_item_orcamento_id_produto"`);
    await queryRunner.query(`DROP INDEX "idx_item_orcamento_id_orcamento"`);
    await queryRunner.query(`DROP TABLE "item_orcamento"`);
  }
}
