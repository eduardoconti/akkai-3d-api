import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVitrineToAssinatura1777000000000 implements MigrationInterface {
  name = 'AddVitrineToAssinatura1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── plano_assinatura ──────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "plano_assinatura"
         ADD COLUMN "slug"           VARCHAR(100),
         ADD COLUMN "resumo"         VARCHAR(255),
         ADD COLUMN "destaque"       BOOLEAN NOT NULL DEFAULT FALSE,
         ADD COLUMN "faixa_etaria"   VARCHAR(120),
         ADD COLUMN "itens_inclusos" TEXT,
         ADD COLUMN "beneficios"     TEXT`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "uk_plano_assinatura_slug" ON "plano_assinatura" ("slug")
       WHERE "slug" IS NOT NULL`,
    );

    // ── kit_mensal ────────────────────────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "kit_mensal"
         ADD COLUMN "titulo"        VARCHAR(200),
         ADD COLUMN "descricao"     TEXT,
         ADD COLUMN "chamada"       VARCHAR(500),
         ADD COLUMN "ativo"         BOOLEAN NOT NULL DEFAULT FALSE,
         ADD COLUMN "itens_vitrine" TEXT`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_kit_mensal_ativo" ON "kit_mensal" ("ativo")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_kit_mensal_ativo"`);

    await queryRunner.query(
      `ALTER TABLE "kit_mensal"
         DROP COLUMN "itens_vitrine",
         DROP COLUMN "ativo",
         DROP COLUMN "chamada",
         DROP COLUMN "descricao",
         DROP COLUMN "titulo"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."uk_plano_assinatura_slug"`,
    );

    await queryRunner.query(
      `ALTER TABLE "plano_assinatura"
         DROP COLUMN "beneficios",
         DROP COLUMN "itens_inclusos",
         DROP COLUMN "faixa_etaria",
         DROP COLUMN "destaque",
         DROP COLUMN "resumo",
         DROP COLUMN "slug"`,
    );
  }
}
