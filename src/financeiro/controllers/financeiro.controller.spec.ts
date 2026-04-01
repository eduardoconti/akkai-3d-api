import { Test, TestingModule } from '@nestjs/testing';
import { FinanceiroController } from '@financeiro/controllers';
import { FinanceiroService } from '@financeiro/services';
import {
  InserirCarteiraUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';

describe('FinanceiroController', () => {
  let controller: FinanceiroController;
  let financeiroService: {
    listarCarteiras: jest.Mock;
    listarDespesas: jest.Mock;
  };
  let inserirCarteiraUseCase: { execute: jest.Mock };
  let inserirDespesaUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    financeiroService = {
      listarCarteiras: jest.fn(),
      listarDespesas: jest.fn(),
    };
    inserirCarteiraUseCase = { execute: jest.fn() };
    inserirDespesaUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceiroController],
      providers: [
        {
          provide: FinanceiroService,
          useValue: financeiroService,
        },
        {
          provide: InserirCarteiraUseCase,
          useValue: inserirCarteiraUseCase,
        },
        {
          provide: InserirDespesaUseCase,
          useValue: inserirDespesaUseCase,
        },
      ],
    }).compile();

    controller = module.get<FinanceiroController>(FinanceiroController);
  });

  it('deve delegar inserção de carteira', async () => {
    inserirCarteiraUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nome: 'CAIXA',
    };

    const result = await controller.inserirCarteira(input as never);

    expect(inserirCarteiraUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve listar carteiras', async () => {
    const carteiras = [{ id: 1 }];
    financeiroService.listarCarteiras.mockResolvedValue(carteiras);

    const result = await controller.listarCarteiras();

    expect(financeiroService.listarCarteiras).toHaveBeenCalled();
    expect(result).toBe(carteiras);
  });
});
