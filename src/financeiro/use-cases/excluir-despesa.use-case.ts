import { Injectable } from '@nestjs/common';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class ExcluirDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(id: number): Promise<void> {
    const despesa = await this.financeiroService.garantirDespesaPorId(id);
    await this.financeiroService.excluirDespesa(despesa.id);
  }
}
