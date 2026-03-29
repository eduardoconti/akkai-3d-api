import { Injectable } from '@nestjs/common';
import { Feira } from '@venda/entities';
import { VendaService } from '@venda/services';

export interface InserirFeiraInput {
  nome: string;
  local?: string;
  descricao?: string;
  ativa?: boolean;
}

@Injectable()
export class InserirFeiraUseCase {
  constructor(private readonly vendaService: VendaService) {}

  async execute(input: InserirFeiraInput): Promise<Feira> {
    const feira = new Feira();
    feira.nome = input.nome;
    feira.local = input.local;
    feira.descricao = input.descricao;
    feira.ativa = input.ativa ?? true;

    return this.vendaService.inserirFeira(feira);
  }
}
