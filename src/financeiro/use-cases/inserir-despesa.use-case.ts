import { Injectable } from '@nestjs/common';
import { InserirDespesaDto } from '@financeiro/dto';
import { Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class InserirDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: InserirDespesaDto): Promise<Despesa> {
    await this.financeiroService.garantirExisteCarteira(input.idCarteira);
    await this.financeiroService.garantirExisteCategoriaDespesa(
      input.idCategoria,
    );

    const despesa = new Despesa();
    despesa.dataLancamento = new Date(`${input.dataLancamento}T00:00:00.000`);
    despesa.descricao = input.descricao.trim();
    despesa.valor = input.valor;
    despesa.idCategoria = input.idCategoria;
    despesa.meioPagamento = input.meioPagamento;
    despesa.idCarteira = input.idCarteira;
    despesa.observacao = input.observacao?.trim();

    return this.financeiroService.inserirDespesa(despesa);
  }
}
