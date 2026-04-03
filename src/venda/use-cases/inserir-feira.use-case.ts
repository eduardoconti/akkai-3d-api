import { Injectable } from '@nestjs/common';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';

export interface InserirFeiraInput {
  nome: string;
  local?: string;
  descricao?: string;
  ativa?: boolean;
}

@Injectable()
export class InserirFeiraUseCase {
  constructor(private readonly feiraService: FeiraService) {}

  async execute(input: InserirFeiraInput): Promise<Feira> {
    const feira = new Feira();
    feira.nome = input.nome;
    feira.local = input.local;
    feira.descricao = input.descricao;
    feira.ativa = input.ativa ?? true;

    return this.feiraService.inserirFeira(feira);
  }
}
