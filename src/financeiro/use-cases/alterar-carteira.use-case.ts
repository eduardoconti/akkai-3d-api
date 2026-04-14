import { Injectable } from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { CarteiraService } from '@financeiro/services';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';

export interface AlterarCarteiraInput {
  id: number;
  nome: string;
  ativa?: boolean;
  meiosPagamento?: MeioPagamento[];
  consideraImpostoVenda?: boolean;
  percentualImpostoVenda?: number | null;
}

@Injectable()
export class AlterarCarteiraUseCase {
  constructor(private readonly carteiraService: CarteiraService) {}

  async execute(input: AlterarCarteiraInput): Promise<Carteira> {
    const carteira = await this.carteiraService.garantirCarteiraPorId(input.id);

    carteira.nome = input.nome;
    carteira.ativa = input.ativa ?? carteira.ativa;
    carteira.meiosPagamento = input.meiosPagamento ?? carteira.meiosPagamento;
    carteira.consideraImpostoVenda =
      input.consideraImpostoVenda ?? carteira.consideraImpostoVenda;
    carteira.percentualImpostoVenda = carteira.consideraImpostoVenda
      ? (input.percentualImpostoVenda ??
        carteira.percentualImpostoVenda ??
        null)
      : null;

    return this.carteiraService.salvarCarteira(carteira);
  }
}
