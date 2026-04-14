import { Injectable } from '@nestjs/common';
import { TaxaMeioPagamentoCarteiraService } from '@financeiro/services';

export interface ExcluirTaxaMeioPagamentoCarteiraInput {
  id: number;
}

@Injectable()
export class ExcluirTaxaMeioPagamentoCarteiraUseCase {
  constructor(
    private readonly taxaService: TaxaMeioPagamentoCarteiraService,
  ) {}

  async execute(input: ExcluirTaxaMeioPagamentoCarteiraInput): Promise<void> {
    await this.taxaService.excluirTaxaMeioPagamentoCarteira(input.id);
  }
}
