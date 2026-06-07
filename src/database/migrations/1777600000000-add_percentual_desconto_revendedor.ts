import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPercentualDescontoRevendedor1777600000000
  implements MigrationInterface
{
  name = 'AddPercentualDescontoRevendedor1777600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "revendedor" ADD "percentual_desconto" numeric(5,2) NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'ALTER TABLE "revendedor" ADD CONSTRAINT "ck_revendedor_percentual_desconto_valido" CHECK ("percentual_desconto" >= 0 AND "percentual_desconto" <= 100)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "revendedor" DROP CONSTRAINT "ck_revendedor_percentual_desconto_valido"',
    );
    await queryRunner.query(
      'ALTER TABLE "revendedor" DROP COLUMN "percentual_desconto"',
    );
  }
}
