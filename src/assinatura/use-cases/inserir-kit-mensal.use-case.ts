import { Injectable } from '@nestjs/common';
import { ItemKitMensal, KitMensal, KitMensalInput } from '@assinatura/entities';
import { KitMensalService, PlanoService } from '@assinatura/services';
import { ProdutoService } from '@produto/services';

@Injectable()
export class InserirKitMensalUseCase {
  constructor(
    private readonly kitMensalService: KitMensalService,
    private readonly planoService: PlanoService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(input: KitMensalInput): Promise<KitMensal> {
    await this.planoService.garantirPlanoPorId(input.idPlano);

    if (input.itens?.length) {
      await Promise.all(
        input.itens.map((item) =>
          this.produtoService.garantirExisteProduto(item.idProduto),
        ),
      );
    }

    if (input.ativo) {
      await this.kitMensalService.desativarTodosKits();
    }

    const kit = KitMensal.criar(input);
    if (input.itens?.length) {
      kit.itens = input.itens.map((item) => ItemKitMensal.criar(item));
    }
    return this.kitMensalService.salvarKit(kit);
  }
}
