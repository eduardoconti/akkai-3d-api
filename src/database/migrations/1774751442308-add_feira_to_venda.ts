import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeiraToVenda1774751442308 implements MigrationInterface {
  name = 'AddFeiraToVenda1774751442308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feira" ("id" SERIAL NOT NULL, "nome" character varying(120) NOT NULL, "local" character varying(120), "descricao" character varying(500), "ativa" boolean NOT NULL DEFAULT true, CONSTRAINT "uk_feira_nome" UNIQUE ("nome"), CONSTRAINT "pk_feira" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "id_feira" integer`);
    await queryRunner.query(
      `ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_feira" FOREIGN KEY ("id_feira") REFERENCES "feira"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_feira"`,
    );
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "id_feira"`);
    await queryRunner.query(`DROP TABLE "feira"`);
  }
}
