/** Papel atribuído a quem se cadastra; o sistema depende dele existir. */
export const PAPEL_PADRAO = 'user';
export const PAPEL_ADMINISTRADOR = 'admin';

/** Papéis que não podem ser renomeados nem excluídos. */
export const PAPEIS_PROTEGIDOS: readonly string[] = [
  PAPEL_PADRAO,
  PAPEL_ADMINISTRADOR,
];
