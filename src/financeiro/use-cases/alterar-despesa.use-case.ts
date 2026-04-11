import { Injectable } from '@nestjs/common';
import { Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
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
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: AlterarDespesaInput): Promise<Despesa> {
    const despesa = await this.financeiroService.garantirDespesaPorId(input.id);

    await this.financeiroService.garantirExisteCarteira(input.idCarteira);
    await this.financeiroService.garantirExisteCategoriaDespesa(
      input.idCategoria,
    );

    despesa.dataLancamento = new Date(input.dataLancamento);
    despesa.descricao = input.descricao.trim();
    despesa.valor = input.valor;
    despesa.idCategoria = input.idCategoria;
    despesa.meioPagamento = input.meioPagamento;
    despesa.idCarteira = input.idCarteira;
    despesa.observacao = input.observacao?.trim();

    return this.financeiroService.alterarDespesa(despesa);
  }
}
