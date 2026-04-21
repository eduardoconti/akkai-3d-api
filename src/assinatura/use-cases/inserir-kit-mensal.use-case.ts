import { Injectable } from '@nestjs/common';
import { KitMensal, KitMensalInput } from '@assinatura/entities';
import { KitMensalService, PlanoService } from '@assinatura/services';

@Injectable()
export class InserirKitMensalUseCase {
  constructor(
    private readonly kitMensalService: KitMensalService,
    private readonly planoService: PlanoService,
  ) {}

  async execute(input: KitMensalInput): Promise<KitMensal> {
    await this.planoService.garantirPlanoPorId(input.idPlano);
    const kit = KitMensal.criar(input);
    return this.kitMensalService.salvarKit(kit);
  }
}
