import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMeiosPagamentoToCarteira1775700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carteira" ADD "meios_pagamento" text NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "carteira" DROP COLUMN "meios_pagamento"`,
    );
  }
}
