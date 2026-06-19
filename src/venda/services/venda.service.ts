import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { ItemVenda, PagamentoVenda, TipoVenda, Venda } from '@venda/entities';
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
    const venda = await this.vendaRepository.findOne({
      where: { id },
      relations: {
        itens: { produto: true },
        feira: true,
        orcamento: true,
        pagamentos: { carteira: true },
      },
    });

    return venda ? this.adicionarValorLiquido(venda) : null;
  }

  async garantirExisteVenda(id: number): Promise<Venda> {
    const venda = await this.obterVendaPorId(id);

    if (!venda) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada.`);
    }

    return venda;
  }

  async inserirVenda(venda: Venda): Promise<Venda> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vendaSalva = await queryRunner.manager.save(venda);
      const movimentacoesEstoque = this.extrairMovimentacoesEstoque(vendaSalva);
      await queryRunner.manager.save(movimentacoesEstoque);

      if (venda.orcamento) {
        await queryRunner.manager.save(venda.orcamento);
      }

      await queryRunner.commitTransaction();
      return this.adicionarValorLiquido(vendaSalva);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao inserir venda', errorMessage);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }

      if (this.ehViolacaoUnicidadeOrcamentoVenda(error)) {
        throw new ConflictException('Orçamento já possui venda vinculada.');
      }

      throw new InternalServerErrorException('Erro ao inserir venda');
    } finally {
      await queryRunner.release();
    }
  }

  async alterarVenda(venda: Venda): Promise<Venda> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.delete(PagamentoVenda, { idVenda: venda.id });
      await queryRunner.manager.delete(ItemVenda, { idVenda: venda.id });
      const vendaSalva = await queryRunner.manager.save(venda);
      const movimentacoesEstoque = this.extrairMovimentacoesEstoque(vendaSalva);
      await queryRunner.manager.save(movimentacoesEstoque);
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

      await queryRunner.manager.delete(PagamentoVenda, { idVenda: venda.id });
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
    const itensQueryBuilder = this.criarQueryBuilderPesquisa(pesquisa, true)
      .leftJoinAndSelect('venda.itens', 'item')
      .leftJoinAndSelect('item.produto', 'produto')
      .distinct(true)
      .orderBy('venda.dataVenda', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    const totalizadoresRaw = (await filtrosQueryBuilder
      .clone()
      .select('COALESCE(SUM(venda.valorTotal), 0)', 'valorTotal')
      .addSelect('COALESCE(SUM(venda.desconto), 0)', 'descontoTotal')
      .addSelect(
        `COALESCE(SUM(venda.valorTotal - COALESCE((
          SELECT SUM(COALESCE(pagamento_total.valor_taxa, 0) + COALESCE(pagamento_total.valor_imposto, 0))
          FROM pagamento_venda pagamento_total
          WHERE pagamento_total.id_venda = venda.id
        ), 0)), 0)`,
        'valorLiquido',
      )
      .getRawOne()) as {
      valorTotal?: string;
      descontoTotal?: string;
      valorLiquido?: string;
    } | null;

    const [itens, totalItens] = await Promise.all([
      itensQueryBuilder.getMany(),
      filtrosQueryBuilder.clone().getCount(),
    ]);

    return {
      itens: itens.map((item) => this.adicionarValorLiquido(item)),
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
      totalizadores: {
        valorTotal: Number(totalizadoresRaw?.valorTotal ?? 0),
        descontoTotal: Number(totalizadoresRaw?.descontoTotal ?? 0),
        valorLiquido: Number(totalizadoresRaw?.valorLiquido ?? 0),
      },
    };
  }

  private adicionarValorLiquido(venda: Venda): Venda {
    venda.valorLiquido = venda.calcularValorLiquido();
    return venda;
  }

  private criarQueryBuilderPesquisa(
    pesquisa: PesquisarVendasDto,
    incluirRelacoes = false,
  ): SelectQueryBuilder<Venda> {
    const dataInicio = pesquisa.dataInicio;
    const dataFim = pesquisa.dataFim ?? pesquisa.dataInicio;
    const queryBuilder = this.vendaRepository.createQueryBuilder('venda');

    if (incluirRelacoes) {
      queryBuilder
        .leftJoinAndSelect('venda.feira', 'feira')
        .leftJoinAndSelect('venda.orcamento', 'orcamento')
        .leftJoinAndSelect('venda.pagamentos', 'pagamento')
        .leftJoinAndSelect('pagamento.carteira', 'carteira');
    }

    if (dataInicio) {
      const range = this.dateService.toUtcDateRange(dataInicio);
      const rangeFim =
        dataFim && dataFim !== dataInicio
          ? this.dateService.toUtcDateRange(dataFim)
          : range;

      queryBuilder.andWhere(
        'venda.dataVenda BETWEEN :dataInicio AND :dataFim',
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

    if (pesquisa.idProduto) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1
          FROM item_venda item_filtro
          WHERE item_filtro.id_venda = venda.id
            AND item_filtro.id_produto = :idProduto
        )`,
        { idProduto: pesquisa.idProduto },
      );
    }

    if (pesquisa.idCarteira) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1
          FROM pagamento_venda pagamento_filtro
          WHERE pagamento_filtro.id_venda = venda.id
            AND pagamento_filtro.id_carteira = :idCarteira
        )`,
        { idCarteira: pesquisa.idCarteira },
      );
    }

    if (pesquisa.meioPagamento) {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1
          FROM pagamento_venda pagamento_filtro
          WHERE pagamento_filtro.id_venda = venda.id
            AND pagamento_filtro.meio_pagamento = :meioPagamento
        )`,
        { meioPagamento: pesquisa.meioPagamento },
      );
    }

    return queryBuilder;
  }

  private extrairMovimentacoesEstoque(venda: Venda): MovimentacaoEstoque[] {
    return venda.obterItensCatalogo().map((item) => {
      const movimentacao = item.movimentacaoEstoque;

      if (!movimentacao) {
        throw new BadRequestException(
          'Item de catálogo sem movimentação de estoque correspondente.',
        );
      }

      movimentacao.idItemVenda = item.id;
      item.movimentacaoEstoque = undefined;

      return movimentacao;
    });
  }

  private ehViolacaoUnicidadeOrcamentoVenda(error: unknown): boolean {
    const driverError = (
      error as { driverError?: { code?: string; constraint?: string } }
    ).driverError;

    return (
      driverError?.code === '23505' &&
      driverError.constraint === 'uk_venda_id_orcamento'
    );
  }
}
