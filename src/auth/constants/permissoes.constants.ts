export const PERMISSOES = {
  AUTENTICACAO: {
    SAIR: 'autenticacao.sair',
  },
  USUARIO: {
    LER: 'usuario.ler',
    INSERIR: 'usuario.inserir',
    ALTERAR: 'usuario.alterar',
    ALTERAR_PAPEL: 'usuario.alterar-papel',
    ALTERAR_STATUS: 'usuario.alterar-status',
    ALTERAR_SENHA: 'usuario.alterar-senha',
  },
  PAPEL: {
    LER: 'papel.ler',
  },
  VENDA: {
    LER: 'venda.ler',
    INSERIR: 'venda.inserir',
    ALTERAR: 'venda.alterar',
    EXCLUIR: 'venda.excluir',
  },
  FEIRA: {
    LER: 'feira.ler',
    INSERIR: 'feira.inserir',
    ALTERAR: 'feira.alterar',
    EXCLUIR: 'feira.excluir',
  },
  PRECO_PRODUTO_FEIRA: {
    LER: 'preco-produto-feira.ler',
    ALTERAR: 'preco-produto-feira.alterar',
    EXCLUIR: 'preco-produto-feira.excluir',
  },
  PRODUTO: {
    LER: 'produto.ler',
    INSERIR: 'produto.inserir',
    ALTERAR: 'produto.alterar',
    EXCLUIR: 'produto.excluir',
  },
  CATEGORIA_PRODUTO: {
    LER: 'categoria-produto.ler',
    INSERIR: 'categoria-produto.inserir',
    ALTERAR: 'categoria-produto.alterar',
    EXCLUIR: 'categoria-produto.excluir',
  },
  ESTOQUE: {
    LER: 'estoque.ler',
    ENTRADA: 'estoque.entrada',
    SAIDA: 'estoque.saida',
  },
  FINANCEIRO: {
    CARTEIRA: {
      LER: 'carteira.ler',
      INSERIR: 'carteira.inserir',
      ALTERAR: 'carteira.alterar',
      EXCLUIR: 'carteira.excluir',
    },
    AJUSTE_CARTEIRA: {
      LER: 'ajuste-carteira.ler',
      INSERIR: 'ajuste-carteira.inserir',
    },
    TAXA_MEIO_PAGAMENTO_CARTEIRA: {
      LER: 'taxa-meio-pagamento-carteira.ler',
      INSERIR: 'taxa-meio-pagamento-carteira.inserir',
      ALTERAR: 'taxa-meio-pagamento-carteira.alterar',
      EXCLUIR: 'taxa-meio-pagamento-carteira.excluir',
    },
    CATEGORIA_DESPESA: {
      LER: 'categoria-despesa.ler',
      INSERIR: 'categoria-despesa.inserir',
      ALTERAR: 'categoria-despesa.alterar',
      EXCLUIR: 'categoria-despesa.excluir',
    },
    DESPESA: {
      LER: 'despesa.ler',
      INSERIR: 'despesa.inserir',
      ALTERAR: 'despesa.alterar',
      EXCLUIR: 'despesa.excluir',
    },
  },
  ASSINATURA: {
    PLANO: {
      LER: 'plano-assinatura.ler',
      INSERIR: 'plano-assinatura.inserir',
      ALTERAR: 'plano-assinatura.alterar',
      EXCLUIR: 'plano-assinatura.excluir',
    },
    ASSINANTE: {
      LER: 'assinante.ler',
      INSERIR: 'assinante.inserir',
      ALTERAR: 'assinante.alterar',
      EXCLUIR: 'assinante.excluir',
    },
    CICLO: {
      LER: 'ciclo-assinatura.ler',
      INSERIR: 'ciclo-assinatura.inserir',
      ALTERAR: 'ciclo-assinatura.alterar',
      EXCLUIR: 'ciclo-assinatura.excluir',
      GERAR: 'ciclo-assinatura.gerar',
    },
    KIT_MENSAL: {
      LER: 'kit-mensal.ler',
      INSERIR: 'kit-mensal.inserir',
      ALTERAR: 'kit-mensal.alterar',
      EXCLUIR: 'kit-mensal.excluir',
    },
  },
  ORCAMENTO: {
    LER: 'orcamento.ler',
    INSERIR: 'orcamento.inserir',
    ALTERAR: 'orcamento.alterar',
    EXCLUIR: 'orcamento.excluir',
  },
  CONSIGNACAO: {
    LER: 'consignacao.ler',
    INSERIR: 'consignacao.inserir',
    REGISTRAR_VENDA: 'consignacao.registrar-venda',
    REGISTRAR_DEVOLUCAO: 'consignacao.registrar-devolucao',
  },
  REVENDEDOR: {
    LER: 'revendedor.ler',
    INSERIR: 'revendedor.inserir',
    ALTERAR: 'revendedor.alterar',
  },
  RELATORIO: {
    LER: 'relatorio.ler',
  },
} as const;
