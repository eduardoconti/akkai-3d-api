import { Body, Controller, Get, Post } from '@nestjs/common';
import { InserirVendaDto } from '@venda/dto';
import { Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { InserirVendaUseCase } from '@venda/use-cases';

@Controller('venda')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
    private readonly inserirVendaUseCase: InserirVendaUseCase,
  ) {}
  @Post()
  async inserirVenda(@Body() inserirVendaInput: InserirVendaDto) {
    const venda = await this.inserirVendaUseCase.execute(inserirVendaInput);
    return venda;
  }

  @Get('')
  async listarVendas(): Promise<Venda[]> {
    return await this.vendaService.listarVendas();
  }
}
