import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    if (
      input.status === StatusOrcamento.FINALIZADO &&
      orcamento.status !== StatusOrcamento.FINALIZADO
    ) {
      throw new BadRequestException(
        'Finalize o orçamento pela venda para alterar o status para finalizado.',
      );
    }

    if (
      input.status === StatusOrcamento.CANCELADO &&
      orcamento.status === StatusOrcamento.FINALIZADO
    ) {
      throw new BadRequestException(
        'Não é possível cancelar um orçamento finalizado.',
      );
    }

    if (input.status !== undefined) {
      orcamento.status = input.status;
    }

    if (input.tipo !== undefined) {
      orcamento.tipo = input.tipo;
      if (input.tipo !== TipoOrcamento.FEIRA) {
        orcamento.idFeira = undefined;
        orcamento.feira = null;
      }
    }

    if (input.canalAtendimento !== undefined) {
      orcamento.canalAtendimento = input.canalAtendimento;
    }

    if (orcamento.tipo !== TipoOrcamento.ONLINE) {
      orcamento.canalAtendimento = undefined;
    }

    if (
      orcamento.tipo === TipoOrcamento.ONLINE &&
      !orcamento.canalAtendimento
    ) {
      throw new BadRequestException(
        'Selecione o canal de atendimento do orçamento online.',
      );
    }

    if (input.idFeira !== undefined) {
      orcamento.idFeira = input.idFeira;
      orcamento.feira = undefined;
    }

    if (input.valor !== undefined) {
      orcamento.valor = input.valor;
    }

    return this.orcamentoService.atualizarOrcamento(orcamento);
  }
}
