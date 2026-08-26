export abstract class ConsultaCaixa {
  abstract garantirCaixaAbertoParaVenda(input: {
    idCaixa?: number;
    idFeira?: number;
    idsCarteiras: number[];
  }): Promise<void>;
}
