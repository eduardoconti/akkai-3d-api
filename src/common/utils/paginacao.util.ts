import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';

export function calcularOffset(pagina: number, tamanhoPagina: number): number {
  return (pagina - 1) * tamanhoPagina;
}

export type MetadadosPaginacao = Omit<ResultadoPaginado<never>, 'itens'>;

export function criarMetadadosPaginacao(
  pagina: number,
  tamanhoPagina: number,
  totalItens: number,
): MetadadosPaginacao {
  return {
    pagina,
    tamanhoPagina,
    totalItens,
    totalPaginas: Math.max(1, Math.ceil(totalItens / tamanhoPagina)),
  };
}

export function criarResultadoPaginado<T>(
  itens: T[],
  pagina: number,
  tamanhoPagina: number,
  totalItens: number,
): ResultadoPaginado<T> {
  return {
    itens,
    ...criarMetadadosPaginacao(pagina, tamanhoPagina, totalItens),
  };
}
