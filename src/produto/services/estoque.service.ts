import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import {
  ListarMovimentacaoEstoqueDto,
  ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE,
  PesquisarMovimentacoesEstoqueDto,
  TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE,
} from '@produto/dto';
import { ProdutoService } from './produto.service';
import { DateService } from '@common/services/date.service';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(MovimentacaoEstoque)
    private readonly movimentacaoEstoqueRepository: Repository<MovimentacaoEstoque>,
    private readonly produtoService: ProdutoService,
    private readonly dateService: DateService,
  ) {}

  async entradaEstoque(
    id: number,
    quantidade: number,
    origem:
      | OrigemMovimentacaoEstoque.COMPRA
      | OrigemMovimentacaoEstoque.AJUSTE
      | OrigemMovimentacaoEstoque.PRODUCAO,
    idUsuarioInclusao: number,
  ): Promise<void> {
    await this.produtoService.garantirExisteProduto(id);

    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: id,
      quantidade,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem,
      idUsuarioInclusao,
    } satisfies CriarMovimentacaoEstoqueInput);

    await this.movimentacaoEstoqueRepository.save(movimentacao);
  }

  async saidaEstoque(
    id: number,
    quantidade: number,
    origem: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA,
    idUsuarioInclusao: number,
  ): Promise<void> {
    await this.produtoService.garantirExisteProduto(id);

    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: id,
      quantidade,
      tipo: TipoMovimentacaoEstoque.SAIDA,
      origem,
      idUsuarioInclusao,
    } satisfies CriarMovimentacaoEstoqueInput);

    await this.movimentacaoEstoqueRepository.save(movimentacao);
  }

  async listarMovimentacoesPorProduto(
    id: number,
    pesquisa: PesquisarMovimentacoesEstoqueDto,
  ): Promise<ResultadoPaginado<ListarMovimentacaoEstoqueDto>> {
    await this.produtoService.garantirExisteProduto(id);

    const [movimentacoes, totalItens] =
      await this.movimentacaoEstoqueRepository.findAndCount({
        where: { idProduto: id },
        relations: { itemVenda: true, usuarioInclusao: true },
        order: { dataInclusao: 'DESC', id: 'DESC' },
        skip: calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina),
        take: pesquisa.tamanhoPagina,
      });

    return criarResultadoPaginado(
      movimentacoes.map((movimentacao) =>
        this.mapearMovimentacao(movimentacao),
      ),
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  async listarMovimentacoes(
    pesquisa: PesquisarMovimentacoesEstoqueDto,
  ): Promise<ResultadoPaginado<ListarMovimentacaoEstoqueDto>> {
    if (pesquisa.idProduto) {
      await this.produtoService.garantirExisteProduto(pesquisa.idProduto);
    }
    const tipos = pesquisa.tipos ?? TIPOS_PADRAO_MOVIMENTACAO_ESTOQUE;
    const origens = pesquisa.origens ?? ORIGENS_PADRAO_MOVIMENTACAO_ESTOQUE;

    const query = this.movimentacaoEstoqueRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.produto', 'produto')
      .leftJoinAndSelect('movimentacao.itemVenda', 'itemVenda')
      .leftJoinAndSelect('movimentacao.usuarioInclusao', 'usuarioInclusao');

    if (pesquisa.dataInicio) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataInicio);
      query.andWhere('movimentacao.dataInclusao >= :dataInicio', {
        dataInicio: range.start,
      });
    }

    if (pesquisa.dataFim) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataFim);
      query.andWhere('movimentacao.dataInclusao <= :dataFim', {
        dataFim: range.end,
      });
    }

    if (tipos.length > 0) {
      query.andWhere('movimentacao.tipo IN (:...tipos)', {
        tipos,
      });
    }

    if (origens.length > 0) {
      query.andWhere('movimentacao.origem IN (:...origens)', {
        origens,
      });
    }

    if (pesquisa.idProduto) {
      query.andWhere('movimentacao.idProduto = :idProduto', {
        idProduto: pesquisa.idProduto,
      });
    }

    const [movimentacoes, totalItens] = await query
      .orderBy('movimentacao.dataInclusao', 'DESC')
      .addOrderBy('movimentacao.id', 'DESC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina)
      .getManyAndCount();

    return criarResultadoPaginado(
      movimentacoes.map((movimentacao) =>
        this.mapearMovimentacao(movimentacao),
      ),
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  private mapearMovimentacao(
    movimentacao: MovimentacaoEstoque,
  ): ListarMovimentacaoEstoqueDto {
    return {
      id: movimentacao.id,
      idProduto: movimentacao.idProduto,
      idItemVenda: movimentacao.idItemVenda,
      idVenda: movimentacao.itemVenda?.idVenda,
      brinde: movimentacao.itemVenda?.brinde,
      usuario: movimentacao.usuarioInclusao?.name ?? '-',
      quantidade: movimentacao.quantidade,
      tipo: movimentacao.tipo,
      origem: movimentacao.origem,
      dataInclusao: movimentacao.dataInclusao,
      produto: movimentacao.produto
        ? {
            id: movimentacao.produto.id,
            codigo: movimentacao.produto.codigo,
            nome: movimentacao.produto.nome,
          }
        : undefined,
    };
  }
}
