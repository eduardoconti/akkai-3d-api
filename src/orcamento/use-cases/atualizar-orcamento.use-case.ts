import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusOrcamento, TipoOrcamento } from '@orcamento/entities';
import { AtualizarOrcamentoDto } from '@orcamento/dto';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';

@Injectable()
export class AtualizarOrcamentoUseCase {
  constructor(private readonly orcamentoService: OrcamentoService) {}

  async execute(id: number, input: AtualizarOrcamentoDto): Promise<Orcamento> {
    const orcamento = await this.orcamentoService.buscarPorId(id);

    if (!orcamento) {
      throw new NotFoundException(`Orçamento #${id} não encontrado.`);
    }

    if (input.nomeCliente !== undefined) {
      orcamento.nomeCliente = input.nomeCliente;
    }

    if (input.telefoneCliente !== undefined) {
      orcamento.telefoneCliente = input.telefoneCliente;
    }

    if (input.descricao !== undefined) {
      orcamento.descricao = input.descricao;
    }

    if (input.linkSTL !== undefined) {
      orcamento.linkSTL = input.linkSTL;
    }

    if (input.status !== undefined) {
      orcamento.status = input.status as StatusOrcamento;
    }

    if (input.tipo !== undefined) {
      orcamento.tipo = input.tipo as TipoOrcamento;
      if (input.tipo !== TipoOrcamento.FEIRA) {
        orcamento.idFeira = undefined;
        orcamento.feira = null;
      }
    }

    if (input.idFeira !== undefined) {
      orcamento.idFeira = input.idFeira;
      orcamento.feira = undefined;
    }

    if (input.valor !== undefined) {
      orcamento.valor = input.valor;
    }

    if (input.quantidade !== undefined) {
      orcamento.quantidade = input.quantidade;
    }

    return this.orcamentoService.atualizarOrcamento(orcamento);
  }
}
