import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrcamento1775600000000 implements MigrationInterface {
  name = 'AddOrcamento1775600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "orcamento" (
        "id" SERIAL NOT NULL,
        "nome_cliente" character varying(120) NOT NULL,
        "telefone_cliente" character varying(30) NOT NULL,
        "descricao" character varying(1000),
        "link_stl" character varying(500),
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_orcamento" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_orcamento_data_inclusao" ON "orcamento" ("data_inclusao") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_orcamento_data_inclusao"`,
    );
    await queryRunner.query(`DROP TABLE "orcamento"`);
  }
}
