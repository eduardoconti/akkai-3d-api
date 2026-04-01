import { Injectable, NotFoundException } from '@nestjs/common';
import { AlterarCarteiraDto } from '@financeiro/dto';
import { Carteira } from '@financeiro/entities';
import { FinanceiroService } from '@financeiro/services';

@Injectable()
export class AlterarCarteiraUseCase {
  constructor(private readonly financeiroService: FinanceiroService) {}

  async execute(id: number, input: AlterarCarteiraDto): Promise<Carteira> {
    const carteira = await this.financeiroService.obterCarteiraPorId(id);

    if (!carteira) {
      throw new NotFoundException('Carteira não encontrada');
    }

    carteira.nome = input.nome.trim().toUpperCase();
    carteira.ativa = input.ativa ?? carteira.ativa;

    return this.financeiroService.salvarCarteira(carteira);
  }
}
