import { Injectable } from '@nestjs/common';
import { CategoriaDespesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

export interface AlterarCategoriaDespesaInput {
  id: number;
  nome: string;
}

@Injectable()
export class AlterarCategoriaDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: AlterarCategoriaDespesaInput): Promise<CategoriaDespesa> {
    const categoria =
      await this.financeiroService.garantirCategoriaDespesaPorId(input.id);

    categoria.nome = input.nome;

    return this.financeiroService.salvarCategoriaDespesa(categoria);
  }
}
