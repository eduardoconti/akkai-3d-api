import { Injectable } from '@nestjs/common';
import { AlterarCarteiraDto } from '@financeiro/dto';
import { Carteira } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class AlterarCarteiraUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(id: number, input: AlterarCarteiraDto): Promise<Carteira> {
    const carteira = await this.financeiroService.garantirCarteiraPorId(id);

    carteira.nome = input.nome;
    carteira.ativa = input.ativa ?? carteira.ativa;

    return this.financeiroService.salvarCarteira(carteira);
  }
}
