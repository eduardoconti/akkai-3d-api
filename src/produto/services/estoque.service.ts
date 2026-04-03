import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';
import { ProdutoService } from './produto.service';

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
  ): Promise<void> {
    await this.produtoService.garantirExisteProduto(id);

    const movimentacao = new MovimentacaoEstoque();
    movimentacao.idProduto = id;
    movimentacao.quantidade = quantidade;
    movimentacao.tipo = TipoMovimentacaoEstoque.ENTRADA;
    movimentacao.origem = origem;

    await this.movimentacaoEstoqueRepository.save(movimentacao);
  }

  async saidaEstoque(
    id: number,
    quantidade: number,
    origem: OrigemMovimentacaoEstoque.AJUSTE | OrigemMovimentacaoEstoque.PERDA,
  ): Promise<void> {
    await this.produtoService.garantirExisteProduto(id);

    const movimentacao = new MovimentacaoEstoque();
    movimentacao.idProduto = id;
    movimentacao.quantidade = quantidade;
    movimentacao.tipo = TipoMovimentacaoEstoque.SAIDA;
    movimentacao.origem = origem;

    await this.movimentacaoEstoqueRepository.save(movimentacao);
  }
}
