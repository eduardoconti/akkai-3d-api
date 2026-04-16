import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusTipoCamposOrcamento1776400000000
  implements MigrationInterface
{
  name = 'AddStatusTipoCamposOrcamento1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "status_orcamento_enum" AS ENUM ('PENDENTE', 'AGUARDANDO_APROVACAO', 'APROVADO', 'PRODUZIDO', 'FINALIZADO')`,
    );
    await queryRunner.query(
      `CREATE TYPE "tipo_orcamento_enum" AS ENUM ('FEIRA', 'LOJA', 'ONLINE')`,
    );

    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "status" "status_orcamento_enum" NOT NULL DEFAULT 'PENDENTE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "tipo" "tipo_orcamento_enum" NOT NULL DEFAULT 'LOJA'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "id_feira" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "valor" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD COLUMN "quantidade" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ALTER COLUMN "telefone_cliente" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "orcamento" ADD CONSTRAINT "fk_orcamento_feira" FOREIGN KEY ("id_feira") REFERENCES "feira"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orcamento_id_feira" ON "orcamento" ("id_feira")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_orcamento_id_feira"`);
    await queryRunner.query(
      `ALTER TABLE "orcamento" DROP CONSTRAINT "fk_orcamento_feira"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" ALTER COLUMN "telefone_cliente" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orcamento" DROP COLUMN "quantidade"`,
    );
    await queryRunner.query(`ALTER TABLE "orcamento" DROP COLUMN "valor"`);
    await queryRunner.query(`ALTER TABLE "orcamento" DROP COLUMN "id_feira"`);
    await queryRunner.query(`ALTER TABLE "orcamento" DROP COLUMN "tipo"`);
    await queryRunner.query(`ALTER TABLE "orcamento" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "tipo_orcamento_enum"`);
    await queryRunner.query(`DROP TYPE "status_orcamento_enum"`);
  }
}
