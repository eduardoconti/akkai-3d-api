export interface DadosCaixaParaVenda {
  idCaixa?: number;
  idFeira?: number;
  idsCarteiras: number[];
}

export abstract class ConsultaCaixa {
  abstract garantirCaixaAbertoParaVenda(
    input: DadosCaixaParaVenda,
  ): Promise<void>;

  /**
   * Venda registrada offline e sincronizada depois: devolve o caixa que pode
   * recebê-la ou `undefined` quando nenhum caixa aberto da feira a aceita.
   */
  abstract resolverCaixaParaVendaOffline(
    input: DadosCaixaParaVenda,
  ): Promise<number | undefined>;
}
