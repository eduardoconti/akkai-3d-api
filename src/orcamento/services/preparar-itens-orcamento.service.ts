import { Injectable } from '@nestjs/common';
import { ConsultaProduto } from '@produto/contracts';
import { ItemOrcamentoInput } from '@orcamento/entities';

export interface PrepararItemOrcamentoInput {
  idProduto: number;
  quantidade: number;
}

/** Confere os produtos informados no orçamento e guarda o nome atual de cada um. */
@Injectable()
export class PrepararItensOrcamentoService {
  constructor(private readonly produtoService: ConsultaProduto) {}

  async preparar(
    itens: PrepararItemOrcamentoInput[],
  ): Promise<ItemOrcamentoInput[]> {
    return Promise.all(
      itens.map(async (item) => {
        const produto = await this.produtoService.garantirExisteProduto(
          item.idProduto,
        );

        return {
          idProduto: item.idProduto,
          nomeProduto: produto.nome,
          quantidade: item.quantidade,
        };
      }),
    );
  }
}
