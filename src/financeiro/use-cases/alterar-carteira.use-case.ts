import { Injectable } from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';
import { MeioPagamento } from '@venda/entities/meio-pagamento.enum';

export interface AlterarCarteiraInput {
  id: number;
  nome: string;
  ativa?: boolean;
  meiosPagamento?: MeioPagamento[];
}

@Injectable()
export class AlterarCarteiraUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: AlterarCarteiraInput): Promise<Carteira> {
    const carteira = await this.financeiroService.garantirCarteiraPorId(input.id);

    carteira.nome = input.nome;
    carteira.ativa = input.ativa ?? carteira.ativa;
    carteira.meiosPagamento = input.meiosPagamento ?? carteira.meiosPagamento;

    return this.financeiroService.salvarCarteira(carteira);
  }
}
