import { ValorProdutoEstoqueDto } from '@relatorio/dto/valor-produto-estoque.dto';

export class ValorProdutosEstoqueDto {
  itens!: ValorProdutoEstoqueDto[];
  pagina!: number;
  tamanhoPagina!: number;
  totalItens!: number;
  totalPaginas!: number;
  // Total geral de quantidade considerando todos os registros do relatório.
  totalQuantidade!: number;
  // Soma dos valores unitários considerando todos os registros do relatório.
  totalValor!: number;
  // Soma do valor total em estoque considerando todos os registros do relatório.
  totalValorTotal!: number;
}
