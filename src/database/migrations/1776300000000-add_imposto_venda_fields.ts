import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImpostoVendaFields1776300000000 implements MigrationInterface {
  name = 'AddImpostoVendaFields1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carteira" ADD "considera_imposto_venda" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "carteira" ADD "percentual_imposto_venda" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" ADD "percentual_imposto" numeric(5,2)`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "valor_imposto" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "valor_imposto"`);
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN "percentual_imposto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carteira" DROP COLUMN "percentual_imposto_venda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carteira" DROP COLUMN "considera_imposto_venda"`,
    );
  }
}
