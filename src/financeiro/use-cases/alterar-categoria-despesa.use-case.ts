import { Injectable } from '@nestjs/common';
import { CategoriaDespesa } from '@financeiro/entities';
import { CategoriaDespesaService } from '@financeiro/services';

export interface AlterarCategoriaDespesaInput {
  id: number;
  nome: string;
}

@Injectable()
export class AlterarCategoriaDespesaUseCase {
  constructor(
    private readonly categoriaDespesaService: CategoriaDespesaService,
  ) {}

  async execute(
    input: AlterarCategoriaDespesaInput,
  ): Promise<CategoriaDespesa> {
    const categoria =
      await this.categoriaDespesaService.garantirCategoriaDespesaPorId(
        input.id,
      );

    categoria.nome = input.nome;

    return this.categoriaDespesaService.salvarCategoriaDespesa(categoria);
  }
}
