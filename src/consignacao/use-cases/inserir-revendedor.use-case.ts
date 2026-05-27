import { Injectable } from '@nestjs/common';
import { InserirRevendedorDto } from '@consignacao/dto';
import { Revendedor } from '@consignacao/entities';
import { RevendedorService } from '@consignacao/services';

@Injectable()
export class InserirRevendedorUseCase {
  constructor(private readonly revendedorService: RevendedorService) {}

  async execute(input: InserirRevendedorDto): Promise<Revendedor> {
    const revendedor = Revendedor.criar(input);
    return this.revendedorService.salvarRevendedor(revendedor);
  }
}
