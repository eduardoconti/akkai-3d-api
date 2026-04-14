import { Injectable } from '@nestjs/common';
import { Despesa } from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import { MeioPagamento } from '@venda/entities';

export interface AlterarDespesaInput {
  id: number;
  dataLancamento: string;
  descricao: string;
  valor: number;
  idCategoria: number;
  meioPagamento: MeioPagamento;
  idCarteira: number;
  observacao?: string;
}

@Injectable()
export class AlterarDespesaUseCase {
  constructor(
    private readonly despesaService: DespesaService,
    private readonly carteiraService: CarteiraService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
  ) {}

  async execute(input: AlterarDespesaInput): Promise<Despesa> {
    const despesa = await this.despesaService.garantirDespesaPorId(input.id);

    await this.carteiraService.garantirExisteCarteira(input.idCarteira);
    await this.categoriaDespesaService.garantirExisteCategoriaDespesa(
      input.idCategoria,
    );

    despesa.atualizar(input);

    return this.despesaService.alterarDespesa(despesa);
  }
}
