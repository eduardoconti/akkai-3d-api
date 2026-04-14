import { Injectable } from '@nestjs/common';
import { CategoriaDespesa } from '@financeiro/entities';
import { CategoriaDespesaService } from '@financeiro/services';

export interface InserirCategoriaDespesaInput {
  nome: string;
}

@Injectable()
export class InserirCategoriaDespesaUseCase {
  constructor(
    private readonly categoriaDespesaService: CategoriaDespesaService,
  ) {}

  async execute(
    input: InserirCategoriaDespesaInput,
  ): Promise<CategoriaDespesa> {
    const categoria = new CategoriaDespesa();
    categoria.nome = input.nome;
    return this.categoriaDespesaService.salvarCategoriaDespesa(categoria);
  }
}
