import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '@financeiro/services';

export interface ExcluirDespesaInput {
  id: number;
}

@Injectable()
export class ExcluirDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: ExcluirDespesaInput): Promise<void> {
    const despesa = await this.financeiroService.garantirDespesaPorId(input.id);
    await this.financeiroService.excluirDespesa(despesa.id);
  }
}
