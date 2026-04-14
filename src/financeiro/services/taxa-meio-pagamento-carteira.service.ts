import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { TaxaMeioPagamentoCarteira } from '@financeiro/entities';

@Injectable()
export class TaxaMeioPagamentoCarteiraService {
  private readonly logger = new Logger(TaxaMeioPagamentoCarteiraService.name);

  constructor(
    @InjectRepository(TaxaMeioPagamentoCarteira)
    private readonly taxaRepository: Repository<TaxaMeioPagamentoCarteira>,
  ) {}

  async salvarTaxaMeioPagamentoCarteira(
    taxa: TaxaMeioPagamentoCarteira,
  ): Promise<TaxaMeioPagamentoCarteira> {
    return this.taxaRepository.save(taxa).catch((error: unknown) => {
      this.logger.error('Erro ao salvar taxa por meio de pagamento e carteira', error);
      lancarExcecaoConflito(
        error,
        'Já existe uma taxa cadastrada para esta carteira e meio de pagamento.',
        'Erro ao salvar taxa por meio de pagamento e carteira',
      );
    });
  }

  async listarTaxasMeioPagamentoCarteira(): Promise<TaxaMeioPagamentoCarteira[]> {
    return this.taxaRepository.find({
      relations: { carteira: true },
      order: {
        carteira: { nome: 'ASC' },
        meioPagamento: 'ASC',
      },
    });
  }

  async obterTaxaMeioPagamentoCarteiraPorId(
    id: number,
  ): Promise<TaxaMeioPagamentoCarteira | null> {
    return this.taxaRepository.findOne({
      where: { id },
      relations: { carteira: true },
    });
  }

  async garantirTaxaMeioPagamentoCarteiraPorId(
    id: number,
  ): Promise<TaxaMeioPagamentoCarteira> {
    const taxa = await this.obterTaxaMeioPagamentoCarteiraPorId(id);

    if (!taxa) {
      throw new NotFoundException(
        `Taxa por meio de pagamento e carteira com ID ${id} não encontrada.`,
      );
    }

    return taxa;
  }

  async excluirTaxaMeioPagamentoCarteira(id: number): Promise<void> {
    const taxa = await this.garantirTaxaMeioPagamentoCarteiraPorId(id);
    await this.taxaRepository.remove(taxa);
  }
}
