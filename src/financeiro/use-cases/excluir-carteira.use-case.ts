import { Injectable } from '@nestjs/common';
import { CarteiraService } from '@financeiro/services';

export interface ExcluirCarteiraInput {
  id: number;
}

@Injectable()
export class ExcluirCarteiraUseCase {
  constructor(private readonly carteiraService: CarteiraService) {}

  async execute(input: ExcluirCarteiraInput): Promise<void> {
    await this.carteiraService.garantirCarteiraPorId(input.id);
    await this.carteiraService.excluirCarteira(input.id);
  }
}
