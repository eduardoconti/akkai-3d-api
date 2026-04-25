import { Injectable } from '@nestjs/common';
import { ItemKitMensal, ItemKitMensalInput, KitMensal } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';
import { ProdutoService } from '@produto/services';

export interface AlterarKitMensalInput {
  id: number;
  itens?: ItemKitMensalInput[];
  titulo?: string;
  descricao?: string;
  chamada?: string;
  ativo?: boolean;
  itensVitrine?: string[];
}

@Injectable()
export class AlterarKitMensalUseCase {
  constructor(
    private readonly kitMensalService: KitMensalService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(input: AlterarKitMensalInput): Promise<KitMensal> {
    const kit = await this.kitMensalService.garantirKitPorId(input.id);

    kit.atualizarVitrine(input);

    if (input.ativo) {
      await this.kitMensalService.desativarTodosKits();
    }

    if (input.itens?.length) {
      await Promise.all(
        input.itens.map((item) =>
          this.produtoService.garantirExisteProduto(item.idProduto),
        ),
      );
      const novosItens = input.itens.map((item) => ItemKitMensal.criar(item));
      return this.kitMensalService.atualizarItensKit(kit, novosItens);
    }

    return this.kitMensalService.salvarKit(kit);
  }
}
