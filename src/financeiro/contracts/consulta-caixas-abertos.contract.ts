export interface CaixaAbertoResumo {
  id: number;
  idFeira: number;
  nomeFeira?: string;
  dataAbertura: Date;
}

export interface CaixasAbertos {
  total: number;
  itens: CaixaAbertoResumo[];
}

export abstract class ConsultaCaixasAbertos {
  /** Caixas ainda abertos há mais de `horas`, do mais antigo para o mais novo. */
  abstract listarAbertosHaMaisDe(
    horas: number,
    limite: number,
  ): Promise<CaixasAbertos>;
}
