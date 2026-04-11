import { Injectable } from '@nestjs/common';
import { VendaService } from '@venda/services';

export interface ExcluirVendaInput {
  id: number;
}

@Injectable()
export class ExcluirVendaUseCase {
  constructor(private readonly vendaService: VendaService) {}

  async execute(input: ExcluirVendaInput): Promise<void> {
    const venda = await this.vendaService.garantirExisteVenda(input.id);
    await this.vendaService.excluirVenda(venda);
  }
}
