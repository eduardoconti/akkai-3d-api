import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveQuantidadeFromOrcamento1778900000000
  implements MigrationInterface
{
  name = 'RemoveQuantidadeFromOrcamento1778900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orcamento"
      DROP COLUMN IF EXISTS "quantidade"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orcamento"
      ADD COLUMN "quantidade" integer
    `);
  }
}
