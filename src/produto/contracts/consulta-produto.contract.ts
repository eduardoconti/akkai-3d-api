import { Produto } from '@produto/entities';

export abstract class ConsultaProduto {
  abstract garantirExisteProduto(id: number): Promise<Produto>;
}
