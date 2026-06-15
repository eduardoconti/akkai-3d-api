import { MigrationInterface, QueryRunner } from 'typeorm';

const permissoes = [
  {
    name: 'transferencia-carteira.ler',
    description: 'Permite consultar transferencias entre carteiras.',
  },
  {
    name: 'transferencia-carteira.inserir',
    description: 'Permite inserir transferencias entre carteiras.',
  },
];

export class AddTransferenciaCarteira1778100000000
  implements MigrationInterface
{
  name = 'AddTransferenciaCarteira1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "transferencia_carteira" (
        "id" SERIAL NOT NULL,
        "data_inclusao" TIMESTAMP NOT NULL DEFAULT now(),
        "data_transferencia" TIMESTAMP NOT NULL,
        "id_carteira_origem" integer NOT NULL,
        "id_carteira_destino" integer NOT NULL,
        "valor" integer NOT NULL,
        "id_usuario_inclusao" integer NOT NULL,
        CONSTRAINT "ck_transferencia_carteira_carteiras_diferentes"
          CHECK ("id_carteira_origem" <> "id_carteira_destino"),
        CONSTRAINT "ck_transferencia_carteira_valor_positivo"
          CHECK ("valor" > 0),
        CONSTRAINT "pk_transferencia_carteira" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_transferencia_carteira_id_carteira_origem" ON "transferencia_carteira" ("id_carteira_origem")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transferencia_carteira_id_carteira_destino" ON "transferencia_carteira" ("id_carteira_destino")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transferencia_carteira_data_transferencia" ON "transferencia_carteira" ("data_transferencia")`,
    );

    await queryRunner.query(`
      ALTER TABLE "transferencia_carteira"
      ADD CONSTRAINT "fk_transferencia_carteira_origem"
      FOREIGN KEY ("id_carteira_origem")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "transferencia_carteira"
      ADD CONSTRAINT "fk_transferencia_carteira_destino"
      FOREIGN KEY ("id_carteira_destino")
      REFERENCES "carteira"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "transferencia_carteira"
      ADD CONSTRAINT "fk_transferencia_carteira_usuario_inclusao"
      FOREIGN KEY ("id_usuario_inclusao")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    const valores = permissoes
      .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(', ');

    await queryRunner.query(
      `
        INSERT INTO "permissions" ("name", "description")
        VALUES ${valores}
        ON CONFLICT ("name")
        DO UPDATE SET "description" = EXCLUDED."description"
      `,
      permissoes.flatMap((permissao) => [
        permissao.name,
        permissao.description,
      ]),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const nomes = permissoes.map((permissao) => permissao.name);

    await queryRunner.query(
      `
        DELETE FROM "role_permissions" "rolePermission"
        USING "permissions" "permission"
        WHERE "rolePermission"."permission_id" = "permission"."id"
          AND "permission"."name" = ANY($1)
      `,
      [nomes],
    );
    await queryRunner.query(
      `
        DELETE FROM "permissions"
        WHERE "name" = ANY($1)
      `,
      [nomes],
    );

    await queryRunner.query(
      `ALTER TABLE "transferencia_carteira" DROP CONSTRAINT "fk_transferencia_carteira_usuario_inclusao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transferencia_carteira" DROP CONSTRAINT "fk_transferencia_carteira_destino"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transferencia_carteira" DROP CONSTRAINT "fk_transferencia_carteira_origem"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_transferencia_carteira_data_transferencia"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_transferencia_carteira_id_carteira_destino"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_transferencia_carteira_id_carteira_origem"`,
    );
    await queryRunner.query(`DROP TABLE "transferencia_carteira"`);
  }
}
