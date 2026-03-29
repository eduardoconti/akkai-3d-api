import { Test, TestingModule } from '@nestjs/testing';
import { VendaController } from '@venda/controllers';
import { Feira, Venda } from '@venda/entities';
import { VendaService } from '@venda/services';
import { InserirFeiraUseCase, InserirVendaUseCase } from '@venda/use-cases';

describe('VendaController', () => {
  let controller: VendaController;
  let vendaService: { listarVendas: jest.Mock; listarFeiras: jest.Mock };
  let inserirFeiraUseCase: { execute: jest.Mock };
  let inserirVendaUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    vendaService = { listarVendas: jest.fn(), listarFeiras: jest.fn() };
    inserirFeiraUseCase = { execute: jest.fn() };
    inserirVendaUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendaController],
      providers: [
        {
          provide: VendaService,
          useValue: vendaService,
        },
        {
          provide: InserirFeiraUseCase,
          useValue: inserirFeiraUseCase,
        },
        {
          provide: InserirVendaUseCase,
          useValue: inserirVendaUseCase,
        },
      ],
    }).compile();

    controller = module.get<VendaController>(VendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar inserção de feira', async () => {
    inserirFeiraUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nome: 'Teatro Reviver',
      local: 'Niteroi',
    };

    const result = await controller.inserirFeira(input);

    expect(inserirFeiraUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar inserção de venda', async () => {
    inserirVendaUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      meioPagamento: 'PIX',
      tipo: 'LOJA',
      itens: [{ idProduto: 1, quantidade: 1 }],
    };

    const result = await controller.inserirVenda(input as never);

    expect(inserirVendaUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve listar vendas', async () => {
    const vendas = [Object.assign(new Venda(), { id: 1 })];
    vendaService.listarVendas.mockResolvedValue(vendas);

    const result = await controller.listarVendas();

    expect(vendaService.listarVendas).toHaveBeenCalled();
    expect(result).toBe(vendas);
  });

  it('deve listar feiras', async () => {
    const feiras = [Object.assign(new Feira(), { id: 1 })];
    vendaService.listarFeiras.mockResolvedValue(feiras);

    const result = await controller.listarFeiras();

    expect(vendaService.listarFeiras).toHaveBeenCalled();
    expect(result).toBe(feiras);
  });
});
