import { Test, TestingModule } from '@nestjs/testing';
import { VendaController } from '@venda/venda.controller';
import { VendaService } from '@venda/services/venda.service';
import { InserirVendaUseCase } from '@venda/use-cases/inserir-venda.use-case';

describe('VendaController', () => {
  let controller: VendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendaController],
      providers: [
        {
          provide: VendaService,
          useValue: { listarVendas: jest.fn() },
        },
        {
          provide: InserirVendaUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<VendaController>(VendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
