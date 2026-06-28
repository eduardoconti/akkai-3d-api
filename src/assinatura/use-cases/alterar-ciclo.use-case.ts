import { Injectable } from '@nestjs/common';
import {
  CicloAssinatura,
  ItemCicloAssinaturaInput,
} from '@assinatura/entities';
import { StatusCiclo } from '@assinatura/enums';
import { CicloService } from '@assinatura/services';
import { ProdutoService } from '@produto/services';

export interface AlterarCicloInput {
  id: number;
  status: StatusCiclo;
  codigoRastreio?: string;
  dataEnvio?: Date;
  observacao?: string;
  itens: ItemCicloAssinaturaInput[];
}

@Injectable()
export class AlterarCicloUseCase {
  constructor(
    private readonly cicloService: CicloService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(input: AlterarCicloInput): Promise<CicloAssinatura> {
    const ciclo = await this.cicloService.garantirCicloPorId(input.id);
    await Promise.all(
      input.itens.map((item) =>
        this.produtoService.garantirExisteProduto(item.idProduto),
      ),
    );
    ciclo.atualizar({
      idAssinante: ciclo.idAssinante,
      mesReferencia: ciclo.mesReferencia,
      anoReferencia: ciclo.anoReferencia,
      status: input.status,
      codigoRastreio: input.codigoRastreio,
      dataEnvio: input.dataEnvio,
      observacao: input.observacao,
      itens: input.itens,
    });
    return this.cicloService.salvarCiclo(ciclo);
  }
}
