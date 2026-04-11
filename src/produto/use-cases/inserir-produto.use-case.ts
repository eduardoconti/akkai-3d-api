import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../common/services/current-user-context.service';
import { Produto } from '@produto/entities';
import { CategoriaProdutoService, ProdutoService } from '@produto/services';

export interface InserirProdutoInput {
  nome: string;
  codigo: string;
  descricao?: string;
  estoqueMinimo?: number;
  idCategoria: number;
  valor: number;
}
@Injectable()
export class InserirProdutoUseCase {
  constructor(
    private readonly produtoService: ProdutoService,
    private readonly categoriaProdutoService: CategoriaProdutoService,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: InserirProdutoInput): Promise<Produto> {
    await this.categoriaProdutoService.garantirExisteCategoria(
      input.idCategoria,
    );

    const novoProduto = new Produto();
    novoProduto.nome = input.nome;
    novoProduto.codigo = input.codigo;
    novoProduto.descricao = input.descricao;
    novoProduto.estoqueMinimo = input.estoqueMinimo;
    novoProduto.idCategoria = input.idCategoria;
    novoProduto.valor = input.valor;
    novoProduto.idUsuarioInclusao = this.currentUserContext.usuarioId;

    return await this.produtoService.salvar(novoProduto);
  }
}
