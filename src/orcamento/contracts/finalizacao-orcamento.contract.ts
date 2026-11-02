import { Orcamento } from '@orcamento/entities';

export abstract class FinalizacaoOrcamento {
  abstract garantirPodeSerFinalizado(id: number): Promise<Orcamento>;
}
