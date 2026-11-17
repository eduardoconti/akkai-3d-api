import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';

export interface ItemAlerta {
  id: number;
  titulo: string;
  detalhe?: string;
  /** Data de referência do item (ex.: abertura do caixa), em ISO 8601. */
  data?: string;
}

export interface Alerta {
  tipo: TipoAlerta;
  severidade: SeveridadeAlerta;
  titulo: string;
  descricao: string;
  quantidade: number;
  /**
   * Assinatura do estado atual do alerta. Muda quando os itens mudam, para o
   * app reexibir um alerta que o usuário já tinha dispensado.
   */
  chave: string;
  itens: ItemAlerta[];
}

/**
 * Calcula um tipo de alerta a partir do estado atual do sistema. Para criar um
 * alerta novo basta implementar esta classe e registrá-la em
 * `PROVEDORES_ALERTA` no módulo.
 */
export abstract class ProvedorAlerta {
  abstract readonly tipo: TipoAlerta;
  /** Permissão necessária para o usuário ver este alerta. */
  abstract readonly permissao: string;
  /** Devolve o alerta ou `null` quando não há nada a avisar. */
  abstract obter(): Promise<Alerta | null>;
}

export const PROVEDORES_ALERTA = Symbol('PROVEDORES_ALERTA');

/** Quantidade máxima de itens exibidos em cada alerta. */
export const LIMITE_ITENS_ALERTA = 5;

export function montarChaveAlerta(
  tipo: TipoAlerta,
  quantidade: number,
  ids: number[],
): string {
  return `${tipo}:${quantidade}:${[...ids].sort((a, b) => a - b).join(',')}`;
}

export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}
