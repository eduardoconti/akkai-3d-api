import { MigrationInterface, QueryRunner } from 'typeorm';

type PermissaoSeed = {
  name: string;
  description: string;
};

const permissoes: PermissaoSeed[] = [
  {
    name: 'autenticacao.sair',
    description: 'Permite encerrar a propria sessao autenticada.',
  },
  {
    name: 'usuario.ler',
    description: 'Permite consultar dados do usuario autenticado.',
  },
  {
    name: 'usuario.inserir',
    description: 'Permite registrar usuarios.',
  },
  {
    name: 'usuario.alterar',
    description: 'Permite alterar dados cadastrais do usuario autenticado.',
  },
  {
    name: 'usuario.alterar-papel',
    description: 'Permite alterar o papel de usuarios.',
  },
  {
    name: 'usuario.alterar-status',
    description: 'Permite alterar o status de usuarios.',
  },
  {
    name: 'usuario.alterar-senha',
    description: 'Permite alterar a senha do usuario autenticado.',
  },
  {
    name: 'papel.ler',
    description: 'Permite listar papeis de usuario.',
  },
  {
    name: 'venda.ler',
    description: 'Permite consultar vendas.',
  },
  {
    name: 'venda.inserir',
    description: 'Permite inserir vendas.',
  },
  {
    name: 'venda.alterar',
    description: 'Permite alterar vendas.',
  },
  {
    name: 'venda.excluir',
    description: 'Permite excluir vendas.',
  },
  {
    name: 'feira.ler',
    description: 'Permite consultar feiras.',
  },
  {
    name: 'feira.inserir',
    description: 'Permite inserir feiras.',
  },
  {
    name: 'feira.alterar',
    description: 'Permite alterar feiras.',
  },
  {
    name: 'feira.excluir',
    description: 'Permite excluir feiras.',
  },
  {
    name: 'preco-produto-feira.ler',
    description: 'Permite consultar precos de produtos por feira.',
  },
  {
    name: 'preco-produto-feira.alterar',
    description: 'Permite alterar precos de produtos por feira.',
  },
  {
    name: 'preco-produto-feira.excluir',
    description: 'Permite excluir precos de produtos por feira.',
  },
  {
    name: 'produto.ler',
    description: 'Permite consultar produtos.',
  },
  {
    name: 'produto.inserir',
    description: 'Permite inserir produtos.',
  },
  {
    name: 'produto.alterar',
    description: 'Permite alterar produtos.',
  },
  {
    name: 'produto.excluir',
    description: 'Permite excluir produtos.',
  },
  {
    name: 'categoria-produto.ler',
    description: 'Permite consultar categorias de produto.',
  },
  {
    name: 'categoria-produto.inserir',
    description: 'Permite inserir categorias de produto.',
  },
  {
    name: 'categoria-produto.alterar',
    description: 'Permite alterar categorias de produto.',
  },
  {
    name: 'categoria-produto.excluir',
    description: 'Permite excluir categorias de produto.',
  },
  {
    name: 'estoque.ler',
    description: 'Permite consultar movimentacoes de estoque.',
  },
  {
    name: 'estoque.entrada',
    description: 'Permite registrar entrada de estoque.',
  },
  {
    name: 'estoque.saida',
    description: 'Permite registrar saida de estoque.',
  },
  {
    name: 'carteira.ler',
    description: 'Permite consultar carteiras.',
  },
  {
    name: 'carteira.inserir',
    description: 'Permite inserir carteiras.',
  },
  {
    name: 'carteira.alterar',
    description: 'Permite alterar carteiras.',
  },
  {
    name: 'carteira.excluir',
    description: 'Permite excluir carteiras.',
  },
  {
    name: 'ajuste-carteira.ler',
    description: 'Permite consultar ajustes de carteira.',
  },
  {
    name: 'ajuste-carteira.inserir',
    description: 'Permite inserir ajustes de carteira.',
  },
  {
    name: 'taxa-meio-pagamento-carteira.ler',
    description: 'Permite consultar taxas de meio de pagamento por carteira.',
  },
  {
    name: 'taxa-meio-pagamento-carteira.inserir',
    description: 'Permite inserir taxas de meio de pagamento por carteira.',
  },
  {
    name: 'taxa-meio-pagamento-carteira.alterar',
    description: 'Permite alterar taxas de meio de pagamento por carteira.',
  },
  {
    name: 'taxa-meio-pagamento-carteira.excluir',
    description: 'Permite excluir taxas de meio de pagamento por carteira.',
  },
  {
    name: 'categoria-despesa.ler',
    description: 'Permite consultar categorias de despesa.',
  },
  {
    name: 'categoria-despesa.inserir',
    description: 'Permite inserir categorias de despesa.',
  },
  {
    name: 'categoria-despesa.alterar',
    description: 'Permite alterar categorias de despesa.',
  },
  {
    name: 'categoria-despesa.excluir',
    description: 'Permite excluir categorias de despesa.',
  },
  {
    name: 'despesa.ler',
    description: 'Permite consultar despesas.',
  },
  {
    name: 'despesa.inserir',
    description: 'Permite inserir despesas.',
  },
  {
    name: 'despesa.alterar',
    description: 'Permite alterar despesas.',
  },
  {
    name: 'despesa.excluir',
    description: 'Permite excluir despesas.',
  },
  {
    name: 'plano-assinatura.ler',
    description: 'Permite consultar planos de assinatura.',
  },
  {
    name: 'plano-assinatura.inserir',
    description: 'Permite inserir planos de assinatura.',
  },
  {
    name: 'plano-assinatura.alterar',
    description: 'Permite alterar planos de assinatura.',
  },
  {
    name: 'plano-assinatura.excluir',
    description: 'Permite excluir planos de assinatura.',
  },
  {
    name: 'assinante.ler',
    description: 'Permite consultar assinantes.',
  },
  {
    name: 'assinante.inserir',
    description: 'Permite inserir assinantes.',
  },
  {
    name: 'assinante.alterar',
    description: 'Permite alterar assinantes.',
  },
  {
    name: 'assinante.excluir',
    description: 'Permite excluir assinantes.',
  },
  {
    name: 'ciclo-assinatura.ler',
    description: 'Permite consultar ciclos de assinatura.',
  },
  {
    name: 'ciclo-assinatura.inserir',
    description: 'Permite inserir ciclos de assinatura.',
  },
  {
    name: 'ciclo-assinatura.alterar',
    description: 'Permite alterar ciclos de assinatura.',
  },
  {
    name: 'ciclo-assinatura.excluir',
    description: 'Permite excluir ciclos de assinatura.',
  },
  {
    name: 'ciclo-assinatura.gerar',
    description: 'Permite gerar ciclos mensais de assinatura.',
  },
  {
    name: 'kit-mensal.ler',
    description: 'Permite consultar kits mensais.',
  },
  {
    name: 'kit-mensal.inserir',
    description: 'Permite inserir kits mensais.',
  },
  {
    name: 'kit-mensal.alterar',
    description: 'Permite alterar kits mensais.',
  },
  {
    name: 'kit-mensal.excluir',
    description: 'Permite excluir kits mensais.',
  },
  {
    name: 'orcamento.ler',
    description: 'Permite consultar orcamentos.',
  },
  {
    name: 'orcamento.inserir',
    description: 'Permite inserir orcamentos.',
  },
  {
    name: 'orcamento.alterar',
    description: 'Permite alterar orcamentos.',
  },
  {
    name: 'orcamento.excluir',
    description: 'Permite excluir orcamentos.',
  },
  {
    name: 'consignacao.ler',
    description: 'Permite consultar consignacoes.',
  },
  {
    name: 'consignacao.inserir',
    description: 'Permite inserir consignacoes.',
  },
  {
    name: 'consignacao.registrar-venda',
    description: 'Permite registrar vendas consignadas.',
  },
  {
    name: 'consignacao.registrar-devolucao',
    description: 'Permite registrar devolucoes consignadas.',
  },
  {
    name: 'revendedor.ler',
    description: 'Permite consultar revendedores.',
  },
  {
    name: 'revendedor.inserir',
    description: 'Permite inserir revendedores.',
  },
  {
    name: 'revendedor.alterar',
    description: 'Permite alterar revendedores.',
  },
  {
    name: 'relatorio.ler',
    description: 'Permite consultar relatorios.',
  },
];

export class AddPermissoesEndpoints1777800000000 implements MigrationInterface {
  name = 'AddPermissoesEndpoints1777800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
