import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxaFieldsToVenda1776200000000 implements MigrationInterface {
  name = 'AddTaxaFieldsToVenda1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" ADD "percentual_taxa" numeric(5,2)`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "valor_taxa" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "valor_taxa"`);
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN "percentual_taxa"`,
    );
  }
}
