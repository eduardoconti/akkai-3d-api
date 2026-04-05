import { Injectable } from '@nestjs/common';
import { CategoriaDespesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

export interface AlterarCategoriaDespesaInput {
  nome: string;
}

@Injectable()
export class AlterarCategoriaDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(
    id: number,
    input: AlterarCategoriaDespesaInput,
  ): Promise<CategoriaDespesa> {
    const categoria =
      await this.financeiroService.garantirCategoriaDespesaPorId(id);

    categoria.nome = input.nome;

    return this.financeiroService.salvarCategoriaDespesa(categoria);
  }
}
