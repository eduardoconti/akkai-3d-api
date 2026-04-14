import { Test, TestingModule } from '@nestjs/testing';
import { FinanceiroController } from '@financeiro/controllers';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import {
  AlterarCarteiraUseCase,
  AlterarCategoriaDespesaUseCase,
  AlterarDespesaUseCase,
  ExcluirDespesaUseCase,
  InserirCarteiraUseCase,
  InserirCategoriaDespesaUseCase,
  InserirDespesaUseCase,
} from '@financeiro/use-cases';

describe('FinanceiroController', () => {
  let controller: FinanceiroController;
  let carteiraService: {
    listarCarteiras: jest.Mock;
    obterCarteiraPorId: jest.Mock;
  };
  let despesaService: { listarDespesas: jest.Mock };
  let categoriaDespesaService: { listarCategoriasDespesa: jest.Mock };
  let alterarCarteiraUseCase: { execute: jest.Mock };
  let inserirCarteiraUseCase: { execute: jest.Mock };
  let inserirDespesaUseCase: { execute: jest.Mock };
  let alterarDespesaUseCase: { execute: jest.Mock };
  let excluirDespesaUseCase: { execute: jest.Mock };
  let inserirCategoriaDespesaUseCase: { execute: jest.Mock };
  let alterarCategoriaDespesaUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    carteiraService = {
      listarCarteiras: jest.fn(),
      obterCarteiraPorId: jest.fn(),
    };
    despesaService = { listarDespesas: jest.fn() };
    categoriaDespesaService = { listarCategoriasDespesa: jest.fn() };
    alterarCarteiraUseCase = { execute: jest.fn() };
    inserirCarteiraUseCase = { execute: jest.fn() };
    inserirDespesaUseCase = { execute: jest.fn() };
    alterarDespesaUseCase = { execute: jest.fn() };
    excluirDespesaUseCase = { execute: jest.fn() };
    inserirCategoriaDespesaUseCase = { execute: jest.fn() };
    alterarCategoriaDespesaUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceiroController],
      providers: [
        { provide: CarteiraService, useValue: carteiraService },
        { provide: DespesaService, useValue: despesaService },
        { provide: CategoriaDespesaService, useValue: categoriaDespesaService },
        { provide: AlterarCarteiraUseCase, useValue: alterarCarteiraUseCase },
        { provide: InserirCarteiraUseCase, useValue: inserirCarteiraUseCase },
        { provide: InserirDespesaUseCase, useValue: inserirDespesaUseCase },
        { provide: AlterarDespesaUseCase, useValue: alterarDespesaUseCase },
        { provide: ExcluirDespesaUseCase, useValue: excluirDespesaUseCase },
        {
          provide: InserirCategoriaDespesaUseCase,
          useValue: inserirCategoriaDespesaUseCase,
        },
        {
          provide: AlterarCategoriaDespesaUseCase,
          useValue: alterarCategoriaDespesaUseCase,
        },
      ],
    }).compile();

    controller = module.get<FinanceiroController>(FinanceiroController);
  });

  it('deve delegar inserção de carteira', async () => {
    inserirCarteiraUseCase.execute.mockResolvedValue({ id: 1 });

    const input = { nome: 'CAIXA' };
    const result = await controller.inserirCarteira(input as never);

    expect(inserirCarteiraUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve listar carteiras', async () => {
    const carteiras = [{ id: 1 }];
    carteiraService.listarCarteiras.mockResolvedValue(carteiras);

    const result = await controller.listarCarteiras();

    expect(carteiraService.listarCarteiras).toHaveBeenCalled();
    expect(result).toBe(carteiras);
  });

  it('deve obter carteira por id', async () => {
    carteiraService.obterCarteiraPorId.mockResolvedValue({ id: 1 });

    const result = await controller.obterCarteiraPorId(1);

    expect(carteiraService.obterCarteiraPorId).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de carteira', async () => {
    const input = { nome: 'NUBANK', ativa: true };
    alterarCarteiraUseCase.execute.mockResolvedValue({ id: 1, ...input });

    const result = await controller.alterarCarteira(1, input);

    expect(alterarCarteiraUseCase.execute).toHaveBeenCalledWith({
      id: 1,
      ...input,
    });
    expect(result).toEqual({ id: 1, ...input });
  });

  it('deve delegar inserção de despesa', async () => {
    const despesa = { id: 1, descricao: 'Aluguel', valor: 150000 };
    inserirDespesaUseCase.execute.mockResolvedValue(despesa);

    const input = {
      descricao: 'Aluguel',
      valor: 150000,
      idCarteira: 1,
      idCategoria: 1,
      meioPagamento: 'PIX',
    };
    const result = await controller.inserirDespesa(input as never);

    expect(inserirDespesaUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toBe(despesa);
  });

  it('deve listar despesas', async () => {
    const despesas = {
      itens: [],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 0,
      totalPaginas: 1,
    };
    despesaService.listarDespesas.mockResolvedValue(despesas);

    const result = await controller.listarDespesas({
      pagina: 1,
      tamanhoPagina: 10,
    } as never);

    expect(despesaService.listarDespesas).toHaveBeenCalled();
    expect(result).toBe(despesas);
  });

  it('deve delegar alteração de despesa', async () => {
    const despesa = { id: 1, descricao: 'Aluguel', valor: 150000 };
    alterarDespesaUseCase.execute.mockResolvedValue(despesa);

    const input = {
      dataLancamento: '2026-04-01',
      descricao: 'Aluguel',
      valor: 150000,
      idCarteira: 1,
      idCategoria: 1,
      meioPagamento: 'PIX',
    };
    const result = await controller.alterarDespesa(1, input as never);

    expect(alterarDespesaUseCase.execute).toHaveBeenCalledWith({
      id: 1,
      ...input,
    });
    expect(result).toBe(despesa);
  });

  it('deve delegar exclusão de despesa', async () => {
    excluirDespesaUseCase.execute.mockResolvedValue(undefined);

    await controller.excluirDespesa(1);

    expect(excluirDespesaUseCase.execute).toHaveBeenCalledWith({ id: 1 });
  });

  it('deve delegar inserção de categoria de despesa', async () => {
    inserirCategoriaDespesaUseCase.execute.mockResolvedValue({
      id: 1,
      nome: 'Embalagem',
    });

    const input = { nome: 'Embalagem' };
    const result = await controller.inserirCategoriaDespesa(input);

    expect(inserirCategoriaDespesaUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1, nome: 'Embalagem' });
  });

  it('deve listar categorias de despesa', async () => {
    const categorias = [{ id: 1, nome: 'Embalagem' }];
    categoriaDespesaService.listarCategoriasDespesa.mockResolvedValue(
      categorias,
    );

    const result = await controller.listarCategoriasDespesa();

    expect(categoriaDespesaService.listarCategoriasDespesa).toHaveBeenCalled();
    expect(result).toBe(categorias);
  });

  it('deve delegar alteração de categoria de despesa', async () => {
    alterarCategoriaDespesaUseCase.execute.mockResolvedValue({
      id: 1,
      nome: 'Embalagem Atualizada',
    });

    const input = { nome: 'Embalagem Atualizada' };
    const result = await controller.alterarCategoriaDespesa(1, input);

    expect(alterarCategoriaDespesaUseCase.execute).toHaveBeenCalledWith({
      id: 1,
      ...input,
    });
    expect(result).toEqual({ id: 1, nome: 'Embalagem Atualizada' });
  });
});
