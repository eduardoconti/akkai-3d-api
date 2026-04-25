import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProdutoCodigoToInteger1776900000000
  implements MigrationInterface
{
  name = 'ChangeProdutoCodigoToInteger1776900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnInfo = (await queryRunner.query(`
      SELECT data_type AS "dataType"
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'produto'
        AND column_name = 'codigo'
    `)) as unknown as Array<{ dataType: string }>;
    const dataType = columnInfo[0]?.dataType;

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM "produto"
          WHERE TRIM("codigo"::text) !~ '^[0-9]+$'
            OR CASE
              WHEN TRIM("codigo"::text) ~ '^[0-9]+$' THEN
                TRIM("codigo"::text)::numeric < 1
                  OR TRIM("codigo"::text)::numeric > 2147483647
              ELSE false
            END
        ) THEN
          RAISE EXCEPTION 'Não é possível converter produto.codigo para integer: existem códigos não numéricos, menores que 1 ou acima de 2147483647.';
        END IF;
      END $$;
    `);

    if (dataType !== 'integer') {
      await queryRunner.query(
        `ALTER TABLE "produto" ALTER COLUMN "codigo" TYPE integer USING TRIM("codigo"::text)::integer`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT IF EXISTS "ck_produto_codigo_positivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ADD CONSTRAINT "ck_produto_codigo_positivo" CHECK ("codigo" > 0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "produto" DROP CONSTRAINT IF EXISTS "ck_produto_codigo_positivo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "produto" ALTER COLUMN "codigo" TYPE character varying(40) USING "codigo"::text`,
    );
  }
}
