import { Body, Controller, Get, Post } from '@nestjs/common';
import { InserirFeiraDto, InserirVendaDto } from '@venda/dto';
import { Feira, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';

@Controller('venda')
export class VendaController {
  constructor(
    private readonly vendaService: VendaService,
    private readonly inserirFeiraUseCase: InserirFeiraUseCase,
    private readonly inserirVendaUseCase: InserirVendaUseCase,
  ) {}

  @Post('feiras')
  async inserirFeira(@Body() input: InserirFeiraDto): Promise<Feira> {
    return await this.inserirFeiraUseCase.execute(input);
  }

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
