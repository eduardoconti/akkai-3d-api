import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAjusteCarteira1776200000000 implements MigrationInterface {
  name = 'AddAjusteCarteira1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tipo_ajuste_carteira_enum" AS ENUM('CREDITO', 'DEBITO')`,
    );
    await queryRunner.query(`
      CREATE TABLE "ajuste_carteira" (
        "id" SERIAL NOT NULL,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(),
        "data_ajuste" TIMESTAMP NOT NULL,
        "id_carteira" integer NOT NULL,
        "tipo" "public"."tipo_ajuste_carteira_enum" NOT NULL,
        "valor" integer NOT NULL,
        "motivo" character varying(120) NOT NULL,
        "observacao" character varying(500),
        "id_usuario_inclusao" integer NOT NULL,
        CONSTRAINT "ck_ajuste_carteira_valor_positivo" CHECK ("valor" > 0),
        CONSTRAINT "pk_ajuste_carteira" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_ajuste_carteira_id_carteira" ON "ajuste_carteira" ("id_carteira")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ajuste_carteira_data_ajuste" ON "ajuste_carteira" ("data_ajuste")`,
    );
    await queryRunner.query(`
      ALTER TABLE "ajuste_carteira"
      ADD CONSTRAINT "fk_ajuste_carteira_carteira"
      FOREIGN KEY ("id_carteira")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ajuste_carteira"
      ADD CONSTRAINT "fk_ajuste_carteira_usuario_inclusao"
      FOREIGN KEY ("id_usuario_inclusao")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ajuste_carteira" DROP CONSTRAINT "fk_ajuste_carteira_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ajuste_carteira" DROP CONSTRAINT "fk_ajuste_carteira_carteira"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_ajuste_carteira_data_ajuste"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_ajuste_carteira_id_carteira"`,
    );
    await queryRunner.query(`DROP TABLE "ajuste_carteira"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_ajuste_carteira_enum"`);
  }
}
