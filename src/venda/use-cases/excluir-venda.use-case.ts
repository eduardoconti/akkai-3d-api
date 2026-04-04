import { Injectable } from '@nestjs/common';
import { VendaService } from '@venda/services';

@Injectable()
export class ExcluirVendaUseCase {
  constructor(private readonly vendaService: VendaService) {}

  async execute(id: number): Promise<void> {
    const venda = await this.vendaService.garantirExisteVenda(id);
    await this.vendaService.excluirVenda(venda);
  }
}
