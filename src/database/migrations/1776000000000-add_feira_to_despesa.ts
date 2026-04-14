import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeiraToDespesa1776000000000 implements MigrationInterface {
  name = 'AddFeiraToDespesa1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "despesa" ADD COLUMN "id_feira" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "despesa" ADD CONSTRAINT "fk_despesa_feira" FOREIGN KEY ("id_feira") REFERENCES "feira"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_despesa_id_feira" ON "despesa" ("id_feira") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_despesa_id_feira"`);
    await queryRunner.query(
      `ALTER TABLE "despesa" DROP CONSTRAINT "fk_despesa_feira"`,
    );
    await queryRunner.query(`ALTER TABLE "despesa" DROP COLUMN "id_feira"`);
  }
}
