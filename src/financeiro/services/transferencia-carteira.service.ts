import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PesquisarTransferenciasCarteiraDto } from '@financeiro/dto';
import { TransferenciaCarteira } from '@financeiro/entities';
import { DateService } from '@common/services/date.service';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class TransferenciaCarteiraService {
  private readonly logger = new Logger(TransferenciaCarteiraService.name);

  constructor(
    @InjectRepository(TransferenciaCarteira)
    private readonly transferenciaCarteiraRepository: Repository<TransferenciaCarteira>,
    private readonly dateService: DateService,
  ) {}

  async inserirTransferenciaCarteira(
    transferencia: TransferenciaCarteira,
  ): Promise<TransferenciaCarteira> {
    return this.transferenciaCarteiraRepository
      .save(transferencia)
      .catch((error) => {
        this.logger.error('Erro ao inserir transferência de carteira', error);
        throw new InternalServerErrorException(
          'Erro ao inserir transferência de carteira',
        );
      });
  }

  async listarTransferenciasPorCarteira(
    idCarteira: number,
  ): Promise<TransferenciaCarteira[]> {
    return this.transferenciaCarteiraRepository.find({
      where: [
        { idCarteiraOrigem: idCarteira },
        { idCarteiraDestino: idCarteira },
      ],
      relations: {
        carteiraOrigem: true,
        carteiraDestino: true,
      },
      order: { dataTransferencia: 'DESC', id: 'DESC' },
    });
  }

  async obterTransferenciaPorId(
    id: number,
  ): Promise<TransferenciaCarteira | null> {
    return this.transferenciaCarteiraRepository.findOne({ where: { id } });
  }

  async garantirTransferenciaPorId(id: number): Promise<TransferenciaCarteira> {
    const transferencia = await this.obterTransferenciaPorId(id);

    if (!transferencia) {
      throw new NotFoundException(`Transferência com ID ${id} não encontrada.`);
    }

    return transferencia;
  }

  async alterarTransferenciaCarteira(
    transferencia: TransferenciaCarteira,
  ): Promise<TransferenciaCarteira> {
    const { id, ...restante } = transferencia;
    await this.transferenciaCarteiraRepository
      .update(id, restante)
      .catch((error) => {
        this.logger.error('Erro ao alterar transferência de carteira', error);
        throw new InternalServerErrorException(
          'Erro ao alterar transferência de carteira',
        );
      });

    return transferencia;
  }

  async excluirTransferenciaCarteira(id: number): Promise<void> {
    await this.transferenciaCarteiraRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir transferência de carteira', error);
      throw new InternalServerErrorException(
        'Erro ao excluir transferência de carteira',
      );
    });
  }

  async pesquisarTransferencias(
    pesquisa: PesquisarTransferenciasCarteiraDto,
  ): Promise<ResultadoPaginado<TransferenciaCarteira>> {
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const filtrosQueryBuilder = this.criarQueryBuilderPesquisa(pesquisa);
    const itensQueryBuilder = this.criarQueryBuilderPesquisa(pesquisa)
      .orderBy('transferencia.dataTransferencia', 'DESC')
      .addOrderBy('transferencia.id', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    const [itens, totalItens] = await Promise.all([
      itensQueryBuilder.getMany(),
      filtrosQueryBuilder.clone().getCount(),
    ]);

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  private criarQueryBuilderPesquisa(
    pesquisa: PesquisarTransferenciasCarteiraDto,
  ): SelectQueryBuilder<TransferenciaCarteira> {
    const termo = pesquisa.termo?.toLowerCase();
    const queryBuilder = this.transferenciaCarteiraRepository
      .createQueryBuilder('transferencia')
      .leftJoinAndSelect('transferencia.carteiraOrigem', 'carteiraOrigem')
      .leftJoinAndSelect('transferencia.carteiraDestino', 'carteiraDestino');

    if (termo) {
      queryBuilder.andWhere(
        `(
          LOWER(carteiraOrigem.nome) LIKE :termo
          OR LOWER(carteiraDestino.nome) LIKE :termo
        )`,
        { termo: `%${termo}%` },
      );
    }

    if (pesquisa.dataInicio) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataInicio);
      queryBuilder.andWhere('transferencia.dataTransferencia >= :dataInicio', {
        dataInicio: range.start,
      });
    }

    if (pesquisa.dataFim) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataFim);
      queryBuilder.andWhere('transferencia.dataTransferencia <= :dataFim', {
        dataFim: range.end,
      });
    }

    if (pesquisa.idCarteiraOrigem) {
      queryBuilder.andWhere(
        'transferencia.idCarteiraOrigem = :idCarteiraOrigem',
        {
          idCarteiraOrigem: pesquisa.idCarteiraOrigem,
        },
      );
    }

    if (pesquisa.idCarteiraDestino) {
      queryBuilder.andWhere(
        'transferencia.idCarteiraDestino = :idCarteiraDestino',
        {
          idCarteiraDestino: pesquisa.idCarteiraDestino,
        },
      );
    }

    return queryBuilder;
  }
}
