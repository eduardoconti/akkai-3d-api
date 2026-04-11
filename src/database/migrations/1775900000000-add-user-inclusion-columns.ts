import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserInclusionColumns1775900000000
  implements MigrationInterface
{
  name = 'AddUserInclusionColumns1775900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" ADD COLUMN "id_usuario_inclusao" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD COLUMN "id_usuario_inclusao" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ADD COLUMN "id_usuario_inclusao" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "despesa" ADD COLUMN "id_usuario_inclusao" integer`,
    );

    await queryRunner.query(
      `UPDATE "venda" SET "id_usuario_inclusao" = 1 WHERE "id_usuario_inclusao" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "produto" SET "id_usuario_inclusao" = 1 WHERE "id_usuario_inclusao" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "movimentacao_estoque" SET "id_usuario_inclusao" = 1 WHERE "id_usuario_inclusao" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "despesa" SET "id_usuario_inclusao" = 1 WHERE "id_usuario_inclusao" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "venda" ALTER COLUMN "id_usuario_inclusao" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ALTER COLUMN "id_usuario_inclusao" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ALTER COLUMN "id_usuario_inclusao" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "despesa" ALTER COLUMN "id_usuario_inclusao" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_usuario_inclusao" FOREIGN KEY ("id_usuario_inclusao") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "fk_produto_usuario_inclusao" FOREIGN KEY ("id_usuario_inclusao") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" ADD CONSTRAINT "fk_movimentacao_estoque_usuario_inclusao" FOREIGN KEY ("id_usuario_inclusao") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "despesa" ADD CONSTRAINT "fk_despesa_usuario_inclusao" FOREIGN KEY ("id_usuario_inclusao") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "despesa" DROP CONSTRAINT "fk_despesa_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" DROP CONSTRAINT "fk_movimentacao_estoque_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT "fk_produto_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_usuario_inclusao"`,
    );

    await queryRunner.query(
      `ALTER TABLE "despesa" DROP COLUMN "id_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movimentacao_estoque" DROP COLUMN "id_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" DROP COLUMN "id_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" DROP COLUMN "id_usuario_inclusao"`,
    );
  }
}
