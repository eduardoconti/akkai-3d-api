import { Injectable } from '@nestjs/common';
import { InserirCarteiraDto } from '@financeiro/dto';
import { Carteira } from '@financeiro/entities';
import { CarteiraService } from '@financeiro/services';

@Injectable()
export class InserirCarteiraUseCase {
  constructor(private readonly carteiraService: CarteiraService) {}

  async execute(input: InserirCarteiraDto): Promise<Carteira> {
    const carteira = new Carteira();
    carteira.nome = input.nome;
    carteira.ativa = input.ativa ?? true;
    carteira.meiosPagamento = input.meiosPagamento ?? [];
    carteira.consideraImpostoVenda = input.consideraImpostoVenda ?? false;
    carteira.percentualImpostoVenda = carteira.consideraImpostoVenda
      ? (input.percentualImpostoVenda ?? null)
      : null;

    return this.carteiraService.salvarCarteira(carteira);
  }
}
