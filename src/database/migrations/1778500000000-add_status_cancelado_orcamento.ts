import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusCanceladoOrcamento1778500000000
  implements MigrationInterface
{
  name = 'AddStatusCanceladoOrcamento1778500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'CANCELADO'
            AND enumtypid = '"status_orcamento_enum"'::regtype
        ) THEN
          ALTER TYPE "status_orcamento_enum" ADD VALUE 'CANCELADO';
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "orcamento"
      SET "status" = 'PENDENTE'
      WHERE "status" = 'CANCELADO'
    `);
    await queryRunner.query(
      `ALTER TYPE "status_orcamento_enum" RENAME TO "status_orcamento_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "status_orcamento_enum" AS ENUM ('ATENDIMENTO', 'PENDENTE', 'AGUARDANDO_APROVACAO', 'APROVADO', 'PRODUZIDO', 'FINALIZADO')`,
    );
    await queryRunner.query(`
      ALTER TABLE "orcamento"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE "status_orcamento_enum"
        USING "status"::text::"status_orcamento_enum",
      ALTER COLUMN "status" SET DEFAULT 'PENDENTE'
    `);
    await queryRunner.query(`DROP TYPE "status_orcamento_enum_old"`);
  }
}
