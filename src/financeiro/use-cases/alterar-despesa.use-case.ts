import { Injectable } from '@nestjs/common';
import { AlterarDespesaDto } from '@financeiro/dto';
import { Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class AlterarDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(id: number, input: AlterarDespesaDto): Promise<Despesa> {
    const despesa = await this.financeiroService.garantirDespesaPorId(id);

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
