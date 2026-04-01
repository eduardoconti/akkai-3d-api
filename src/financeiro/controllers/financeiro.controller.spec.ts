import { Test, TestingModule } from '@nestjs/testing';
import { FinanceiroController } from '@financeiro/controllers';
import { FinanceiroService } from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  InserirCarteiraUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';

describe('FinanceiroController', () => {
  let controller: FinanceiroController;
  let financeiroService: {
    listarCarteiras: jest.Mock;
    listarDespesas: jest.Mock;
    obterCarteiraPorId: jest.Mock;
  };
  let alterarCarteiraUseCase: { execute: jest.Mock };
  let inserirCarteiraUseCase: { execute: jest.Mock };
  let inserirDespesaUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    financeiroService = {
      listarCarteiras: jest.fn(),
      listarDespesas: jest.fn(),
      obterCarteiraPorId: jest.fn(),
    };
    alterarCarteiraUseCase = { execute: jest.fn() };
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
          provide: AlterarCarteiraUseCase,
          useValue: alterarCarteiraUseCase,
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

  it('deve obter carteira por id', async () => {
    financeiroService.obterCarteiraPorId.mockResolvedValue({ id: 1 });

    const result = await controller.obterCarteiraPorId(1);

    expect(financeiroService.obterCarteiraPorId).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de carteira', async () => {
    const input = { nome: 'NUBANK', ativa: true };
    alterarCarteiraUseCase.execute.mockResolvedValue({ id: 1, ...input });

    const result = await controller.alterarCarteira(1, input);

    expect(alterarCarteiraUseCase.execute).toHaveBeenCalledWith(1, input);
    expect(result).toEqual({ id: 1, ...input });
  });
});
