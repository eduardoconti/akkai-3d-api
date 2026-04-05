import { Injectable } from '@nestjs/common';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';

export interface InserirOrcamentoInput {
  nomeCliente: string;
  telefoneCliente: string;
  descricao?: string;
  linkSTL?: string;
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

    return this.orcamentoService.inserirOrcamento(orcamento);
  }
}
