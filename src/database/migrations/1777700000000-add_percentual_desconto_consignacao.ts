import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPercentualDescontoConsignacao1777700000000
  implements MigrationInterface
{
  name = 'AddPercentualDescontoConsignacao1777700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "consignacao" ADD "percentual_desconto" numeric(5,2) NOT NULL DEFAULT 0',
    );
    await queryRunner.query(`
      UPDATE "consignacao"
      SET "percentual_desconto" = "revendedor"."percentual_desconto"
      FROM "revendedor"
      WHERE "revendedor"."id" = "consignacao"."id_revendedor"
    `);
    await queryRunner.query(
      'ALTER TABLE "consignacao" ADD CONSTRAINT "ck_consignacao_percentual_desconto_valido" CHECK ("percentual_desconto" >= 0 AND "percentual_desconto" <= 100)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "consignacao" DROP CONSTRAINT "ck_consignacao_percentual_desconto_valido"',
    );
    await queryRunner.query(
      'ALTER TABLE "consignacao" DROP COLUMN "percentual_desconto"',
    );
  }
}
