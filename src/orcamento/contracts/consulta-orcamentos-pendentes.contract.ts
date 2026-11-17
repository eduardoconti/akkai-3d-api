export interface OrcamentoPendenteResumo {
  id: number;
  nomeCliente: string;
  dataInclusao: Date;
}

export interface OrcamentosPendentes {
  total: number;
  itens: OrcamentoPendenteResumo[];
}

export abstract class ConsultaOrcamentosPendentes {
  /** Orçamentos com status PENDENTE, do mais antigo para o mais novo. */
  abstract listarPendentes(limite: number): Promise<OrcamentosPendentes>;
}
