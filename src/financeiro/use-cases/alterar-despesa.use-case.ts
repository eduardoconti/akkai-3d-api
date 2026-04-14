import { Injectable } from '@nestjs/common';
import { Despesa } from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { FeiraService } from '@venda/services';

export interface AlterarDespesaInput {
  id: number;
  dataLancamento: string;
  descricao: string;
  valor: number;
  idCategoria: number;
  meioPagamento: MeioPagamento;
  idCarteira: number;
  idFeira?: number;
  observacao?: string;
}

@Injectable()
export class AlterarDespesaUseCase {
  constructor(
    private readonly despesaService: DespesaService,
    private readonly carteiraService: CarteiraService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
    private readonly feiraService: FeiraService,
  ) {}

  async execute(input: AlterarDespesaInput): Promise<Despesa> {
    const despesa = await this.despesaService.garantirDespesaPorId(input.id);

    await this.carteiraService.garantirExisteCarteira(input.idCarteira);
    await this.categoriaDespesaService.garantirExisteCategoriaDespesa(
      input.idCategoria,
    );
    if (input.idFeira) {
      await this.feiraService.garantirExisteFeira(input.idFeira);
    }

    despesa.atualizar(input);

    return this.despesaService.alterarDespesa(despesa);
  }
}
