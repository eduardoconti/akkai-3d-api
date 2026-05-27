import { Injectable } from '@nestjs/common';
import { AlterarRevendedorDto } from '@consignacao/dto';
import { Revendedor } from '@consignacao/entities';
import { RevendedorService } from '@consignacao/services';

export interface AlterarRevendedorInput extends AlterarRevendedorDto {
  id: number;
}

@Injectable()
export class AlterarRevendedorUseCase {
  constructor(private readonly revendedorService: RevendedorService) {}

  async execute(input: AlterarRevendedorInput): Promise<Revendedor> {
    const revendedor = await this.revendedorService.garantirRevendedorPorId(
      input.id,
    );
    revendedor.atualizar(input);
    return this.revendedorService.salvarRevendedor(revendedor);
  }
}
