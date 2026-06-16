import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusAtendimentoCanalAtendimentoOrcamento1778300000000
  implements MigrationInterface
{
  name = 'AddStatusAtendimentoCanalAtendimentoOrcamento1778300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'ATENDIMENTO'
            AND enumtypid = '"status_orcamento_enum"'::regtype
        ) THEN
          ALTER TYPE "status_orcamento_enum" ADD VALUE 'ATENDIMENTO' BEFORE 'PENDENTE';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `CREATE TYPE "canal_atendimento_orcamento_enum" AS ENUM ('WPP', 'INSTAGRAM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "canal_atendimento" "canal_atendimento_orcamento_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orcamento" DROP COLUMN "canal_atendimento"`,
    );
    await queryRunner.query(`DROP TYPE "canal_atendimento_orcamento_enum"`);

    await queryRunner.query(`
      UPDATE "orcamento"
      SET "status" = 'PENDENTE'
      WHERE "status" = 'ATENDIMENTO'
    `);
    await queryRunner.query(
      `ALTER TYPE "status_orcamento_enum" RENAME TO "status_orcamento_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "status_orcamento_enum" AS ENUM ('PENDENTE', 'AGUARDANDO_APROVACAO', 'APROVADO', 'PRODUZIDO', 'FINALIZADO')`,
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
