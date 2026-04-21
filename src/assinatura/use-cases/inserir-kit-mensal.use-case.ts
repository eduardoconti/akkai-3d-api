import { Injectable } from '@nestjs/common';
import { KitMensal, KitMensalInput } from '@assinatura/entities';
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
    await Promise.all(
      input.itens.map((item) =>
        this.produtoService.garantirExisteProduto(item.idProduto),
      ),
    );
    const kit = KitMensal.criar(input);
    return this.kitMensalService.salvarKit(kit);
  }
}
