export interface ResultadoPaginado<T> {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}

export interface ResultadoPaginadoComTotalizadores<T, TTotalizadores>
  extends ResultadoPaginado<T> {
  totalizadores: TTotalizadores;
}
