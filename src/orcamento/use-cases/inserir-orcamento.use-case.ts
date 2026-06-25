import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CanalAtendimentoOrcamento,
  Orcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';

export interface InserirOrcamentoInput {
  nomeCliente: string;
  telefoneCliente?: string;
  descricao?: string;
  linkSTL?: string;
  status?: StatusOrcamento;
  tipo: TipoOrcamento;
  canalAtendimento?: CanalAtendimentoOrcamento;
  idFeira?: number;
  valor?: number;
}

@Injectable()
export class InserirOrcamentoUseCase {
  constructor(private readonly orcamentoService: OrcamentoService) {}

  async execute(input: InserirOrcamentoInput): Promise<Orcamento> {
    if (input.tipo === TipoOrcamento.ONLINE && !input.canalAtendimento) {
      throw new BadRequestException(
        'Selecione o canal de atendimento do orçamento online.',
      );
    }

    const orcamento = new Orcamento();
    orcamento.nomeCliente = input.nomeCliente;
    orcamento.telefoneCliente = input.telefoneCliente;
    orcamento.descricao = input.descricao;
    orcamento.linkSTL = input.linkSTL;
    orcamento.dataInclusao = new Date();
    orcamento.status = input.status ?? StatusOrcamento.PENDENTE;
    orcamento.tipo = input.tipo;
    orcamento.canalAtendimento =
      input.tipo === TipoOrcamento.ONLINE ? input.canalAtendimento : undefined;
    orcamento.idFeira =
      input.tipo === TipoOrcamento.FEIRA ? input.idFeira : undefined;
    orcamento.valor = input.valor;

    return this.orcamentoService.inserirOrcamento(orcamento);
  }
}
