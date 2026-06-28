import { StatusProduto } from '@produto/enums';

class CategoriaProdutoResumoListaDto {
  id!: number;
  nome!: string;
}

export class ListarProdutoDto {
  id!: number;
  nome!: string;
  codigo!: number;
  descricao?: string;
  idCategoria!: number;
  estoqueMinimo?: number;
  valor!: number;
  status!: StatusProduto;
  quantidadeEstoque!: number;
  categoria!: CategoriaProdutoResumoListaDto;
}
