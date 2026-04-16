import { Injectable } from '@nestjs/common';
import { Orcamento, StatusOrcamento, TipoOrcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';

export interface InserirOrcamentoInput {
  nomeCliente: string;
  telefoneCliente?: string;
  descricao?: string;
  linkSTL?: string;
  status?: StatusOrcamento;
  tipo: TipoOrcamento;
  idFeira?: number;
  valor?: number;
  quantidade?: number;
}

@Injectable()
export class InserirOrcamentoUseCase {
  constructor(private readonly orcamentoService: OrcamentoService) {}

  async execute(input: InserirOrcamentoInput): Promise<Orcamento> {
    const orcamento = new Orcamento();
    orcamento.nomeCliente = input.nomeCliente;
    orcamento.telefoneCliente = input.telefoneCliente;
    orcamento.descricao = input.descricao;
    orcamento.linkSTL = input.linkSTL;
    orcamento.dataInclusao = new Date();
    orcamento.status = input.status ?? StatusOrcamento.PENDENTE;
    orcamento.tipo = input.tipo;
    orcamento.idFeira =
      input.tipo === TipoOrcamento.FEIRA ? input.idFeira : undefined;
    orcamento.valor = input.valor;
    orcamento.quantidade = input.quantidade;

    return this.orcamentoService.inserirOrcamento(orcamento);
  }
}
