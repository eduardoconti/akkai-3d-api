import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Orcamento, StatusOrcamento, TipoOrcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { MovimentacaoEstoque } from '@produto/entities';
import { TipoVenda, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';

export interface ExecutarFinalizarOrcamentoInput {
  idOrcamento: number;
  tipo: TipoVenda;
  idFeira?: number;
  venda: Venda;
  movimentacoesEstoque: MovimentacaoEstoque[];
}

@Injectable()
export class FinalizarOrcamentoUseCase {
  constructor(
    private readonly orcamentoService: OrcamentoService,
    private readonly vendaService: VendaService,
  ) {}

  async execute(input: ExecutarFinalizarOrcamentoInput): Promise<Venda> {
    const orcamento = await this.garantirOrcamentoPodeSerFinalizado(input);

    return await this.vendaService.inserirVendaFinalizandoOrcamento(
      input.venda,
      input.movimentacoesEstoque,
      orcamento,
    );
  }

  private async garantirOrcamentoPodeSerFinalizado(
    input: ExecutarFinalizarOrcamentoInput,
  ): Promise<Orcamento> {
    const orcamento = await this.orcamentoService.buscarPorId(
      input.idOrcamento,
    );

    if (!orcamento) {
      throw new NotFoundException(
        `Orçamento #${input.idOrcamento} não encontrado.`,
      );
    }

    if (orcamento.status === StatusOrcamento.FINALIZADO) {
      throw new BadRequestException(
        `Orçamento #${orcamento.id} já está finalizado.`,
      );
    }

    if (orcamento.tipo !== (input.tipo as unknown as TipoOrcamento)) {
      throw new BadRequestException(
        'O tipo da venda deve ser igual ao tipo do orçamento.',
      );
    }

    if (
      orcamento.tipo === TipoOrcamento.FEIRA &&
      orcamento.idFeira !== undefined &&
      orcamento.idFeira !== input.idFeira
    ) {
      throw new BadRequestException(
        'A feira da venda deve ser igual à feira do orçamento.',
      );
    }

    return orcamento;
  }
}
