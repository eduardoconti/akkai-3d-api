import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PesquisarDespesasDto } from '@financeiro/dto';
import { Despesa } from '@financeiro/entities';
import { DateService } from '@common/services/date.service';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { Repository } from 'typeorm';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class DespesaService {
  private readonly logger = new Logger(DespesaService.name);

  constructor(
    @InjectRepository(Despesa)
    private readonly despesaRepository: Repository<Despesa>,
    private readonly dateService: DateService,
  ) {}

  async inserirDespesa(despesa: Despesa): Promise<Despesa> {
    return this.despesaRepository.save(despesa).catch((error) => {
      this.logger.error('Erro ao inserir despesa', error);
      throw new InternalServerErrorException('Erro ao inserir despesa');
    });
  }

  async obterDespesaPorId(id: number): Promise<Despesa | null> {
    return this.despesaRepository.findOne({ where: { id } });
  }

  async garantirDespesaPorId(id: number): Promise<Despesa> {
    const despesa = await this.obterDespesaPorId(id);
    if (!despesa) {
      throw new NotFoundException(`Despesa com ID ${id} não encontrada.`);
    }
    return despesa;
  }

  async alterarDespesa(despesa: Despesa): Promise<Despesa> {
    const { id, ...restante } = despesa;
    await this.despesaRepository.update(id, restante).catch((error) => {
      this.logger.error('Erro ao alterar despesa', error);
      throw new InternalServerErrorException('Erro ao alterar despesa');
    });

    return despesa;
  }

  async excluirDespesa(id: number): Promise<void> {
    await this.despesaRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir despesa', error);
      throw new InternalServerErrorException('Erro ao excluir despesa');
    });
  }

  async listarDespesas(
    pesquisa: PesquisarDespesasDto,
  ): Promise<ResultadoPaginado<Despesa>> {
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const termo = pesquisa.termo?.toLowerCase();

    const queryBuilder = this.despesaRepository
      .createQueryBuilder('despesa')
      .leftJoinAndSelect('despesa.carteira', 'carteira')
      .leftJoinAndSelect('despesa.categoria', 'categoria')
      .orderBy('despesa.dataLancamento', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.andWhere(
        `(
          LOWER(despesa.descricao) LIKE :termo
          OR LOWER(COALESCE(despesa.observacao, '')) LIKE :termo
          OR LOWER(carteira.nome) LIKE :termo
          OR LOWER(categoria.nome) LIKE :termo
        )`,
        { termo: `%${termo}%` },
      );
    }

    if (pesquisa.dataInicio) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataInicio);
      queryBuilder.andWhere('despesa.dataLancamento >= :dataInicio', {
        dataInicio: range.start,
      });
    }

    if (pesquisa.dataFim) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataFim);
      queryBuilder.andWhere('despesa.dataLancamento <= :dataFim', {
        dataFim: range.end,
      });
    }

    if (pesquisa.idsCategorias && pesquisa.idsCategorias.length > 0) {
      queryBuilder.andWhere('despesa.idCategoria IN (:...idsCategorias)', {
        idsCategorias: pesquisa.idsCategorias,
      });
    }

    const [itens, totalItens] = await queryBuilder.getManyAndCount();

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }
}
