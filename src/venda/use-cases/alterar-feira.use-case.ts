import { Injectable } from '@nestjs/common';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';

export interface AlterarFeiraInput {
  id: number;
  nome: string;
  local?: string;
  descricao?: string;
  ativa?: boolean;
}

@Injectable()
export class AlterarFeiraUseCase {
  constructor(private readonly feiraService: FeiraService) {}

  async execute(input: AlterarFeiraInput): Promise<Feira> {
    const feira = await this.feiraService.garantirFeiraPorId(input.id);

    feira.nome = input.nome;
    feira.local = input.local;
    feira.descricao = input.descricao;
    feira.ativa = input.ativa ?? true;

    return this.feiraService.salvarFeira(feira);
  }
}
