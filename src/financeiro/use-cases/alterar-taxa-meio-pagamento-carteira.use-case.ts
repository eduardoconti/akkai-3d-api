import { BadRequestException, Injectable } from '@nestjs/common';
import { AlterarTaxaMeioPagamentoCarteiraDto } from '@financeiro/dto';
import { TaxaMeioPagamentoCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';

export interface AlterarTaxaMeioPagamentoCarteiraInput
  extends AlterarTaxaMeioPagamentoCarteiraDto {
  id: number;
}

@Injectable()
export class AlterarTaxaMeioPagamentoCarteiraUseCase {
  constructor(
    private readonly taxaService: TaxaMeioPagamentoCarteiraService,
    private readonly carteiraService: CarteiraService,
  ) {}

  async execute(
    input: AlterarTaxaMeioPagamentoCarteiraInput,
  ): Promise<TaxaMeioPagamentoCarteira> {
    const taxa = await this.taxaService.garantirTaxaMeioPagamentoCarteiraPorId(
      input.id,
    );
    const carteira = await this.carteiraService.garantirCarteiraPorId(
      input.idCarteira,
    );

    if (!carteira.aceitaMeioPagamento(input.meioPagamento)) {
      throw new BadRequestException(
        `A carteira não aceita o meio de pagamento ${input.meioPagamento}.`,
      );
    }

    taxa.atualizar(input);

    return this.taxaService.salvarTaxaMeioPagamentoCarteira(taxa);
  }
}
