import { Injectable } from '@nestjs/common';
import { InserirCarteiraDto } from '@financeiro/dto';
import { Carteira } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class InserirCarteiraUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(input: InserirCarteiraDto): Promise<Carteira> {
    const carteira = new Carteira();
    carteira.nome = input.nome;
    carteira.ativa = input.ativa ?? true;
    carteira.meiosPagamento = input.meiosPagamento ?? [];

    return this.financeiroService.salvarCarteira(carteira);
  }
}
