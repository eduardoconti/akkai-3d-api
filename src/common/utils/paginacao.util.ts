export function calcularOffset(pagina: number, tamanhoPagina: number): number {
  return (pagina - 1) * tamanhoPagina;
}
