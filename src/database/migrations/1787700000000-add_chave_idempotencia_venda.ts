import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChaveIdempotenciaVenda1787700000000
  implements MigrationInterface
{
  name = 'AddChaveIdempotenciaVenda1787700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" ADD COLUMN "chave_idempotencia" character varying(64)`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uk_venda_chave_idempotencia"
      ON "venda" ("chave_idempotencia")
      WHERE "chave_idempotencia" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uk_venda_chave_idempotencia"`);
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN "chave_idempotencia"`,
    );
  }
}
