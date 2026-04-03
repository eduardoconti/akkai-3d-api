import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1775185541381 implements MigrationInterface {
  name = 'AddIndexes1775185541381';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "ck_item_venda_desconto_nao_excede_bruto"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "ck_item_venda_desconto_nao_negativo"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" DROP CONSTRAINT "ck_item_venda_valor_total_consistente"`,
    );
    await queryRunner.query(
      `UPDATE "item_venda" SET "valor_total" = "quantidade" * "valor_unitario"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "ck_item_venda_valor_total_consistente" CHECK (("valor_total" = ("quantidade" * "valor_unitario")))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "uq_role_permissions_role_permission"`,
    );
    await queryRunner.query(`ALTER TABLE "item_venda" DROP COLUMN "desconto"`);
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_sessions_validacao" ON "refresh_sessions" ("user_id", "revoked_at", "expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_refresh_sessions_user_id" ON "refresh_sessions" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_is_active_email" ON "users" ("is_active", "email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movimentacao_estoque_id_produto_tipo" ON "movimentacao_estoque" ("id_produto", "tipo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_movimentacao_estoque_id_produto" ON "movimentacao_estoque" ("id_produto") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_produto_id_categoria" ON "produto" ("id_categoria") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_data_inclusao_tipo" ON "venda" ("data_inclusao", "tipo") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_data_inclusao" ON "venda" ("data_inclusao") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_feira" ON "venda" ("id_feira") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_venda_id_carteira" ON "venda" ("id_carteira") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_despesa_data_lancamento" ON "despesa" ("data_lancamento") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_despesa_id_carteira" ON "despesa" ("id_carteira") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_despesa_id_carteira"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_despesa_data_lancamento"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_venda_id_carteira"`);
    await queryRunner.query(`DROP INDEX "public"."idx_venda_id_feira"`);
    await queryRunner.query(`DROP INDEX "public"."idx_venda_data_inclusao"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_venda_data_inclusao_tipo"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_produto_id_categoria"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_movimentacao_estoque_id_produto"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_movimentacao_estoque_id_produto_tipo"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_users_is_active_email"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_refresh_sessions_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_refresh_sessions_validacao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD "desconto" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "uq_role_permissions_role_permission" UNIQUE ("role_id", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "ck_item_venda_desconto_nao_negativo" CHECK ((desconto >= 0))`,
    );
    await queryRunner.query(
      `ALTER TABLE "item_venda" ADD CONSTRAINT "ck_item_venda_desconto_nao_excede_bruto" CHECK ((desconto <= (quantidade * valor_unitario)))`,
    );
  }
}
