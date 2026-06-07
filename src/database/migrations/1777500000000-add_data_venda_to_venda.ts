import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataVendaToVenda1777500000000 implements MigrationInterface {
  name = 'AddDataVendaToVenda1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "venda" ADD "data_venda" TIMESTAMP`);
    await queryRunner.query(
      `UPDATE "venda" SET "data_venda" = "data_inclusao" WHERE "data_venda" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" ALTER COLUMN "data_venda" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_data_venda" ON "venda" ("data_venda")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_data_venda_tipo" ON "venda" ("data_venda", "tipo")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_venda_data_venda_tipo"`);
    await queryRunner.query(`DROP INDEX "public"."idx_venda_data_venda"`);
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "data_venda"`);
  }
}
