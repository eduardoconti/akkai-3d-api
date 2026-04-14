import { Injectable } from '@nestjs/common';
import { DespesaService } from '@financeiro/services';

export interface ExcluirDespesaInput {
  id: number;
}

@Injectable()
export class ExcluirDespesaUseCase {
  constructor(private readonly despesaService: DespesaService) {}

  async execute(input: ExcluirDespesaInput): Promise<void> {
    const despesa = await this.despesaService.garantirDespesaPorId(input.id);
    await this.despesaService.excluirDespesa(despesa.id);
  }
}
