import { Body, Controller, Get, Post } from '@nestjs/common';
import { Venda } from '@venda/entities/venda.entity';
import { VendaService } from '@venda/services/venda.service';
import { InserirVendaDto } from '@venda/dto/inserir-venda.dto';
import { InserirVendaUseCase } from '@venda/use-cases/inserir-venda.use-case';

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
