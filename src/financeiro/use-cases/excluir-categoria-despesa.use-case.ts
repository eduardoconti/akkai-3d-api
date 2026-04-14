import { Injectable } from '@nestjs/common';
import { CategoriaDespesaService } from '@financeiro/services';

export interface ExcluirCategoriaDespesaInput {
  id: number;
}

@Injectable()
export class ExcluirCategoriaDespesaUseCase {
  constructor(
    private readonly categoriaDespesaService: CategoriaDespesaService,
  ) {}

  async execute(input: ExcluirCategoriaDespesaInput): Promise<void> {
    await this.categoriaDespesaService.garantirCategoriaDespesaPorId(input.id);
    await this.categoriaDespesaService.excluirCategoriaDespesa(input.id);
  }
}
