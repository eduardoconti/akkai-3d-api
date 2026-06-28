import { Injectable } from '@nestjs/common';
import { CicloAssinatura, CicloAssinaturaInput } from '@assinatura/entities';
import { StatusCiclo } from '@assinatura/enums';
import { AssinanteService, CicloService } from '@assinatura/services';
import { ProdutoService } from '@produto/services';

@Injectable()
export class InserirCicloUseCase {
  constructor(
    private readonly cicloService: CicloService,
    private readonly assinanteService: AssinanteService,
    private readonly produtoService: ProdutoService,
  ) {}

  async execute(input: CicloAssinaturaInput): Promise<CicloAssinatura> {
    await this.assinanteService.garantirAssinantePorId(input.idAssinante);
    await Promise.all(
      input.itens.map((item) =>
        this.produtoService.garantirExisteProduto(item.idProduto),
      ),
    );
    const ciclo = CicloAssinatura.criar({
      ...input,
      status: input.status ?? StatusCiclo.PENDENTE,
    });
    return this.cicloService.salvarCiclo(ciclo);
  }
}
