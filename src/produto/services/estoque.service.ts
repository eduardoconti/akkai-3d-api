import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import {
  ListarMovimentacaoEstoqueDto,
  PesquisarMovimentacoesEstoqueDto,
} from '@produto/dto';
import { ProdutoService } from './produto.service';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '../../common/utils/paginacao.util';

@Injectable()
export class EstoqueService {
  private readonly logger = new Logger(EstoqueService.name);

  constructor(
    @InjectRepository(MovimentacaoEstoque)
    private readonly movimentacaoEstoqueRepository: Repository<MovimentacaoEstoque>,
    private readonly produtoService: ProdutoService,
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

    const movimentacao = new MovimentacaoEstoque();
    movimentacao.idProduto = id;
    movimentacao.quantidade = quantidade;
    movimentacao.tipo = TipoMovimentacaoEstoque.ENTRADA;
    movimentacao.origem = origem;
    movimentacao.idUsuarioInclusao = idUsuarioInclusao;

    await this.movimentacaoEstoqueRepository.save(movimentacao);
  }

  async saidaEstoque(
    id: number,
    quantidade: number,
    origem: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA,
    idUsuarioInclusao: number,
  ): Promise<void> {
    await this.produtoService.garantirExisteProduto(id);

    const movimentacao = new MovimentacaoEstoque();
    movimentacao.idProduto = id;
    movimentacao.quantidade = quantidade;
    movimentacao.tipo = TipoMovimentacaoEstoque.SAIDA;
    movimentacao.origem = origem;
    movimentacao.idUsuarioInclusao = idUsuarioInclusao;

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
        relations: { usuarioInclusao: true },
        order: { dataInclusao: 'DESC', id: 'DESC' },
        skip: calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina),
        take: pesquisa.tamanhoPagina,
      });

    return {
      itens: movimentacoes.map((movimentacao) => ({
        id: movimentacao.id,
        idProduto: movimentacao.idProduto,
        idItemVenda: movimentacao.idItemVenda,
        usuario: movimentacao.usuarioInclusao?.name ?? '-',
        quantidade: movimentacao.quantidade,
        tipo: movimentacao.tipo,
        origem: movimentacao.origem,
        dataInclusao: movimentacao.dataInclusao,
      })),
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }
}
