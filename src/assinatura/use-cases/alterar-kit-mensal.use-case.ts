import { Injectable } from '@nestjs/common';
import { ItemKitMensal, ItemKitMensalInput } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';
import { ProdutoService } from '@produto/services';

export interface AlterarKitMensalInput {
  id: number;
  itens: ItemKitMensalInput[];
}

@Injectable()
export class AlterarKitMensalUseCase {
  constructor(
    private readonly kitMensalService: KitMensalService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(
    input: AlterarKitMensalInput,
  ): Promise<import('@assinatura/entities').KitMensal> {
    const kit = await this.kitMensalService.garantirKitPorId(input.id);
    await Promise.all(
      input.itens.map((item) =>
        this.produtoService.garantirExisteProduto(item.idProduto),
      ),
    );
    const novosItens = input.itens.map((item) => ItemKitMensal.criar(item));
    return this.kitMensalService.atualizarItensKit(kit, novosItens);
  }
}
