import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCaixa1787500000000 implements MigrationInterface {
  name = 'CreateCaixa1787500000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "status_caixa_enum" AS ENUM ('ABERTO', 'FECHADO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "caixa" ("id" SERIAL NOT NULL, "id_feira" integer NOT NULL, "status" "status_caixa_enum" NOT NULL, "data_abertura" TIMESTAMP NOT NULL, "data_fechamento" TIMESTAMP, "id_usuario_abertura" integer NOT NULL, "id_usuario_fechamento" integer, "observacao" character varying(500), CONSTRAINT "pk_caixa" PRIMARY KEY ("id"), CONSTRAINT "fk_caixa_feira" FOREIGN KEY ("id_feira") REFERENCES "feira"("id") ON DELETE NO ACTION, CONSTRAINT "fk_caixa_usuario_abertura" FOREIGN KEY ("id_usuario_abertura") REFERENCES "users"("id"), CONSTRAINT "fk_caixa_usuario_fechamento" FOREIGN KEY ("id_usuario_fechamento") REFERENCES "users"("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uk_caixa_aberto_feira" ON "caixa" ("id_feira") WHERE "status" = 'ABERTO'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_caixa_id_feira_status" ON "caixa" ("id_feira", "status")`,
    );
    await queryRunner.query(
      `CREATE TABLE "conferencia_carteira_caixa" ("id" SERIAL NOT NULL, "id_caixa" integer NOT NULL, "id_carteira" integer NOT NULL, "valor_abertura" integer NOT NULL, "total_entradas" integer, "valor_esperado_fechamento" integer, "valor_informado_fechamento" integer, "diferenca" integer, CONSTRAINT "ck_conferencia_valor_abertura_nao_negativo" CHECK ("valor_abertura" >= 0), CONSTRAINT "uk_conferencia_caixa_carteira" UNIQUE ("id_caixa", "id_carteira"), CONSTRAINT "pk_conferencia_carteira_caixa" PRIMARY KEY ("id"), CONSTRAINT "fk_conferencia_caixa" FOREIGN KEY ("id_caixa") REFERENCES "caixa"("id") ON DELETE CASCADE, CONSTRAINT "fk_conferencia_carteira" FOREIGN KEY ("id_carteira") REFERENCES "carteira"("id") ON DELETE NO ACTION)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_conferencia_id_carteira" ON "conferencia_carteira_caixa" ("id_carteira")`,
    );
    await queryRunner.query(`ALTER TABLE "venda" ADD "id_caixa" integer`);
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_caixa" ON "venda" ("id_caixa")`,
    );
    await queryRunner.query(
      `ALTER TABLE "venda" ADD CONSTRAINT "fk_venda_caixa" FOREIGN KEY ("id_caixa") REFERENCES "caixa"("id") ON DELETE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO permissions (name, description) VALUES ('caixa.ler', 'Consultar caixas'), ('caixa.abrir', 'Abrir caixas'), ('caixa.fechar', 'Fechar caixas') ON CONFLICT (name) DO NOTHING`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venda" DROP CONSTRAINT "fk_venda_caixa"`,
    );
    await queryRunner.query(`DROP INDEX "idx_venda_id_caixa"`);
    await queryRunner.query(`ALTER TABLE "venda" DROP COLUMN "id_caixa"`);
    await queryRunner.query(`DROP TABLE "conferencia_carteira_caixa"`);
    await queryRunner.query(`DROP TABLE "caixa"`);
    await queryRunner.query(`DROP TYPE "status_caixa_enum"`);
  }
}
