import { Injectable } from '@nestjs/common';
import { FeiraService } from '@venda/services';

export interface ExcluirFeiraInput {
  id: number;
}

@Injectable()
export class ExcluirFeiraUseCase {
  constructor(private readonly feiraService: FeiraService) {}

  async execute(input: ExcluirFeiraInput): Promise<void> {
    await this.feiraService.garantirFeiraPorId(input.id);
    await this.feiraService.excluirFeira(input.id);
  }
}
