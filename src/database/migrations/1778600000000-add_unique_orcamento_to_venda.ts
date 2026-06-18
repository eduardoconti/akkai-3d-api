import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueOrcamentoToVenda1778600000000
  implements MigrationInterface
{
  name = 'AddUniqueOrcamentoToVenda1778600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_venda_id_orcamento"`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_venda_id_orcamento"
      ON "venda" ("id_orcamento")
      WHERE "id_orcamento" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uk_venda_id_orcamento"`);
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_orcamento" ON "venda" ("id_orcamento")`,
    );
  }
}
