import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { InserirTaxaMeioPagamentoCarteiraDto } from '@financeiro/dto';
import { TaxaMeioPagamentoCarteira } from '@financeiro/entities';
import {
  CarteiraService,
  TaxaMeioPagamentoCarteiraService,
} from '@financeiro/services';

@Injectable()
export class InserirTaxaMeioPagamentoCarteiraUseCase {
  constructor(
    private readonly taxaService: TaxaMeioPagamentoCarteiraService,
    private readonly carteiraService: CarteiraService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(
    input: InserirTaxaMeioPagamentoCarteiraDto,
  ): Promise<TaxaMeioPagamentoCarteira> {
    const carteira = await this.carteiraService.garantirCarteiraPorId(
      input.idCarteira,
    );

    if (!carteira.aceitaMeioPagamento(input.meioPagamento)) {
      throw new BadRequestException(
        `A carteira não aceita o meio de pagamento ${input.meioPagamento}.`,
      );
    }

    const taxa = TaxaMeioPagamentoCarteira.criar({
      ...input,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    });

    return this.taxaService.salvarTaxaMeioPagamentoCarteira(taxa);
  }
}
