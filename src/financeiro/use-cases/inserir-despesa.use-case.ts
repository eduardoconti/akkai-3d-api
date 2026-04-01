import { Injectable, NotFoundException } from '@nestjs/common';
import { InserirDespesaDto } from '@financeiro/dto';
import { Despesa } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class InserirDespesaUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: InserirDespesaDto): Promise<Despesa> {
    const carteiraExiste = await this.financeiroService.existeCarteira(
      input.idCarteira,
    );

    if (!carteiraExiste) {
      throw new NotFoundException(
        `Carteira com ID ${input.idCarteira} não encontrada.`,
      );
    }

    const despesa = new Despesa();
    despesa.dataLancamento = new Date(`${input.dataLancamento}T00:00:00.000`);
    despesa.descricao = input.descricao.trim();
    despesa.valor = input.valor;
    despesa.categoria = input.categoria;
    despesa.meioPagamento = input.meioPagamento;
    despesa.idCarteira = input.idCarteira;
    despesa.observacao = input.observacao?.trim();

    return this.financeiroService.inserirDespesa(despesa);
  }
}
