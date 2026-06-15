import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDataVendaFromDataInclusao1777900000000
  implements MigrationInterface
{
  name = 'SetDataVendaFromDataInclusao1777900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "venda"
      SET "data_venda" = "data_inclusao"
    `);
  }

  public async down(): Promise<void> {
    // Não é possível restaurar os horários anteriores de data_venda.
  }
}
