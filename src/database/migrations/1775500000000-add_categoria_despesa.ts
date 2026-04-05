import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoriaDespesa1775500000000 implements MigrationInterface {
  name = 'AddCategoriaDespesa1775500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cria tabela de categorias de despesa
    await queryRunner.query(`
      CREATE TABLE "categoria_despesa" (
        "id" SERIAL NOT NULL,
        "nome" character varying(80) NOT NULL,
        CONSTRAINT "uk_categoria_despesa_nome" UNIQUE ("nome"),
        CONSTRAINT "pk_categoria_despesa" PRIMARY KEY ("id")
      )
    `);

    // Popula com os valores do enum anterior
    await queryRunner.query(`
      INSERT INTO "categoria_despesa" ("nome") VALUES
        ('Despesa Fixa'),
        ('Matéria-prima'),
        ('Embalagem'),
        ('Evento'),
        ('Transporte'),
        ('Outros')
    `);

    // Adiciona coluna id_categoria na despesa (temporariamente nullable)
    await queryRunner.query(`
      ALTER TABLE "despesa" ADD COLUMN "id_categoria" integer
    `);

    // Migra os dados existentes mapeando o enum antigo para os novos IDs
    await queryRunner.query(`
      UPDATE "despesa" SET "id_categoria" = (
        SELECT "id" FROM "categoria_despesa"
        WHERE "nome" = CASE "categoria"::text
          WHEN 'DESPESA_FIXA'  THEN 'Despesa Fixa'
          WHEN 'MATERIA_PRIMA' THEN 'Matéria-prima'
          WHEN 'EMBALAGEM'     THEN 'Embalagem'
          WHEN 'EVENTO'        THEN 'Evento'
          WHEN 'TRANSPORTE'    THEN 'Transporte'
          WHEN 'OUTROS'        THEN 'Outros'
        END
      )
    `);

    // Torna a coluna NOT NULL após a migração dos dados
    await queryRunner.query(`
      ALTER TABLE "despesa" ALTER COLUMN "id_categoria" SET NOT NULL
    `);

    // Adiciona FK e índice
    await queryRunner.query(`
      CREATE INDEX "idx_despesa_id_categoria" ON "despesa" ("id_categoria")
    `);
    await queryRunner.query(`
      ALTER TABLE "despesa"
        ADD CONSTRAINT "fk_despesa_categoria_despesa"
        FOREIGN KEY ("id_categoria")
        REFERENCES "categoria_despesa"("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    // Remove a coluna enum antiga
    await queryRunner.query(`
      ALTER TABLE "despesa" DROP COLUMN "categoria"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."categoria_despesa_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recria o tipo enum
    await queryRunner.query(`
      CREATE TYPE "public"."categoria_despesa_enum" AS ENUM (
        'DESPESA_FIXA', 'MATERIA_PRIMA', 'EMBALAGEM', 'EVENTO', 'TRANSPORTE', 'OUTROS'
      )
    `);

    // Readiciona a coluna enum (temporariamente nullable)
    await queryRunner.query(`
      ALTER TABLE "despesa" ADD COLUMN "categoria" "public"."categoria_despesa_enum"
    `);

    // Migra os dados de volta
    await queryRunner.query(`
      UPDATE "despesa" SET "categoria" = (
        CASE (SELECT "nome" FROM "categoria_despesa" WHERE "id" = "despesa"."id_categoria")
          WHEN 'Despesa Fixa'   THEN 'DESPESA_FIXA'
          WHEN 'Matéria-prima'  THEN 'MATERIA_PRIMA'
          WHEN 'Embalagem'      THEN 'EMBALAGEM'
          WHEN 'Evento'         THEN 'EVENTO'
          WHEN 'Transporte'     THEN 'TRANSPORTE'
          ELSE 'OUTROS'
        END
      )::"public"."categoria_despesa_enum"
    `);

    await queryRunner.query(`
      ALTER TABLE "despesa" ALTER COLUMN "categoria" SET NOT NULL
    `);

    // Remove FK, índice e coluna id_categoria
    await queryRunner.query(`
      ALTER TABLE "despesa" DROP CONSTRAINT "fk_despesa_categoria_despesa"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."idx_despesa_id_categoria"
    `);
    await queryRunner.query(`
      ALTER TABLE "despesa" DROP COLUMN "id_categoria"
    `);

    // Remove tabela de categorias
    await queryRunner.query(`DROP TABLE "categoria_despesa"`);
  }
}
