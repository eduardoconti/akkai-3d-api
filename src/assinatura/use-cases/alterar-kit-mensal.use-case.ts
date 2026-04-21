import { Injectable } from '@nestjs/common';
import { ItemKitMensal, ItemKitMensalInput } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';

export interface AlterarKitMensalInput {
  id: number;
  itens: ItemKitMensalInput[];
}

@Injectable()
export class AlterarKitMensalUseCase {
  constructor(private readonly kitMensalService: KitMensalService) {}

  async execute(
    input: AlterarKitMensalInput,
  ): Promise<import('@assinatura/entities').KitMensal> {
    const kit = await this.kitMensalService.garantirKitPorId(input.id);
    const novosItens = input.itens.map((item) => ItemKitMensal.criar(item));
    return this.kitMensalService.atualizarItensKit(kit, novosItens);
  }
}
