import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdOrcamentoVenda1778400000000 implements MigrationInterface {
  name = 'AddIdOrcamentoVenda1778400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" ADD COLUMN "id_orcamento" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_orcamento" ON "venda" ("id_orcamento")`,
    );
    await queryRunner.query(`
      ALTER TABLE "venda"
      ADD CONSTRAINT "fk_venda_orcamento"
      FOREIGN KEY ("id_orcamento")
      REFERENCES "orcamento"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_orcamento"`,
    );
    await queryRunner.query(`DROP INDEX "idx_venda_id_orcamento"`);
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "id_orcamento"`);
  }
}
