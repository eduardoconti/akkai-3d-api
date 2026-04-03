import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1775185541381 implements MigrationInterface {
  name = 'AddIndexes1775185541381';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
