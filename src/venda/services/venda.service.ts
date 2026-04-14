import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { ItemVenda, TipoVenda, Venda } from '@venda/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities';
import { PesquisarVendasDto, TotalizadoresVendasDto } from '@venda/dto';
import { ResultadoPaginadoComTotalizadores } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';
import { DateService } from '@common/services/date.service';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class VendaService {
  private readonly logger = new Logger(VendaService.name);

  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,
    @InjectRepository(Carteira)
    private readonly carteiraRepository: Repository<Carteira>,
    private readonly dataSource: DataSource,
    private readonly dateService: DateService,
  ) {}

  async existeCarteira(idCarteira: number): Promise<boolean> {
    return this.carteiraRepository.exists({
      where: { id: idCarteira, ativa: true },
    });
  }

  async obterVendaPorId(id: number): Promise<Venda | null> {
    return this.vendaRepository.findOne({
      where: { id },
      relations: {
        itens: { produto: true },
        feira: true,
        carteira: true,
      },
    });
  }

  async garantirExisteVenda(id: number): Promise<Venda> {
    const venda = await this.obterVendaPorId(id);

    if (!venda) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
    }

    return venda;
  }

  async inserirVenda(
    venda: Venda,
    movimentacaoEstoque: MovimentacaoEstoque[],
  ): Promise<Venda> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vendaSalva = await queryRunner.manager.save(venda);
      this.vincularMovimentacoesAosItens(vendaSalva, movimentacaoEstoque);
      await queryRunner.manager.save(movimentacaoEstoque);
      await queryRunner.commitTransaction();
      return vendaSalva;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao inserir venda', errorMessage);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Erro ao inserir venda');
    } finally {
      await queryRunner.release();
    }
  }

  async alterarVenda(
    venda: Venda,
    movimentacaoEstoque: MovimentacaoEstoque[],
  ): Promise<Venda> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.delete(ItemVenda, { idVenda: venda.id });
      const vendaSalva = await queryRunner.manager.save(venda);
      this.vincularMovimentacoesAosItens(vendaSalva, movimentacaoEstoque);
      await queryRunner.manager.save(movimentacaoEstoque);
      await queryRunner.commitTransaction();
      return (await this.obterVendaPorId(vendaSalva.id)) ?? vendaSalva;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao alterar venda', errorMessage);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Erro ao alterar venda');
    } finally {
      await queryRunner.release();
    }
  }

  async excluirVenda(venda: Venda): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.delete(ItemVenda, { idVenda: venda.id });
      await queryRunner.manager.delete(Venda, { id: venda.id });
      await queryRunner.commitTransaction();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao excluir venda', errorMessage);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Erro ao excluir venda');
    } finally {
      await queryRunner.release();
    }
  }

  async listarVendas(
    pesquisa: PesquisarVendasDto,
  ): Promise<ResultadoPaginadoComTotalizadores<Venda, TotalizadoresVendasDto>> {
    const dataInicio = pesquisa.dataInicio;
    const dataFim = pesquisa.dataFim ?? pesquisa.dataInicio;

    if (dataInicio && dataFim && dataFim < dataInicio) {
      throw new BadRequestException(
        'A data final não pode ser menor que a data inicial.',
      );
    }

    if (pesquisa.idFeira && pesquisa.tipo !== TipoVenda.FEIRA) {
      throw new BadRequestException(
        'O filtro por feira só pode ser utilizado quando o tipo de venda for FEIRA.',
      );
    }

    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const filtrosQueryBuilder = this.criarQueryBuilderPesquisa(pesquisa);
    const itensQueryBuilder = this.criarQueryBuilderPesquisa(pesquisa)
      .leftJoinAndSelect('venda.itens', 'item')
      .leftJoinAndSelect('item.produto', 'produto')
      .distinct(true)
      .orderBy('venda.id', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    const totalizadoresRaw = (await filtrosQueryBuilder
      .clone()
      .select('COALESCE(SUM(venda.valorTotal), 0)', 'valorTotal')
      .addSelect('COALESCE(SUM(venda.desconto), 0)', 'descontoTotal')
      .getRawOne()) as { valorTotal?: string; descontoTotal?: string } | null;

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
      totalizadores: {
        valorTotal: Number(totalizadoresRaw?.valorTotal ?? 0),
        descontoTotal: Number(totalizadoresRaw?.descontoTotal ?? 0),
      },
    };
  }

  private criarQueryBuilderPesquisa(
    pesquisa: PesquisarVendasDto,
  ): SelectQueryBuilder<Venda> {
    const dataInicio = pesquisa.dataInicio;
    const dataFim = pesquisa.dataFim ?? pesquisa.dataInicio;
    const queryBuilder = this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.feira', 'feira')
      .leftJoinAndSelect('venda.carteira', 'carteira');

    if (dataInicio) {
      const range = this.dateService.toUtcDateRange(dataInicio);
      const rangeFim =
        dataFim && dataFim !== dataInicio
          ? this.dateService.toUtcDateRange(dataFim)
          : range;

      queryBuilder.andWhere(
        'venda.dataInclusao BETWEEN :dataInicio AND :dataFim',
        {
          dataInicio: range.start,
          dataFim: rangeFim.end,
        },
      );
    }

    if (pesquisa.tipo) {
      queryBuilder.andWhere('venda.tipo = :tipo', {
        tipo: pesquisa.tipo,
      });
    }

    if (pesquisa.idFeira) {
      queryBuilder.andWhere('venda.idFeira = :idFeira', {
        idFeira: pesquisa.idFeira,
      });
    }

    if (pesquisa.idCarteira) {
      queryBuilder.andWhere('venda.idCarteira = :idCarteira', {
        idCarteira: pesquisa.idCarteira,
      });
    }

    if (pesquisa.meioPagamento) {
      queryBuilder.andWhere('venda.meioPagamento = :meioPagamento', {
        meioPagamento: pesquisa.meioPagamento,
      });
    }

    return queryBuilder;
  }

  private vincularMovimentacoesAosItens(
    venda: Venda,
    movimentacoesEstoque: MovimentacaoEstoque[],
  ): void {
    const itensCatalogo = venda.itens.filter((item) => item.idProduto);

    itensCatalogo.forEach((item, index) => {
      const movimentacao = movimentacoesEstoque[index];

      if (!movimentacao) {
        return;
      }

      movimentacao.idItemVenda = item.id;
      movimentacao.itemVenda = item;
    });
  }
}
