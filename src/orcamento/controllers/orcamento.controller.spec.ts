import { Test, TestingModule } from '@nestjs/testing';
import { OrcamentoController } from '@orcamento/controllers';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { InserirOrcamentoUseCase } from '@orcamento/use-cases';

describe('OrcamentoController', () => {
  let controller: OrcamentoController;
  let orcamentoService: { listarOrcamentos: jest.Mock };
  let inserirOrcamentoUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    orcamentoService = { listarOrcamentos: jest.fn() };
    inserirOrcamentoUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrcamentoController],
      providers: [
        { provide: OrcamentoService, useValue: orcamentoService },
        { provide: InserirOrcamentoUseCase, useValue: inserirOrcamentoUseCase },
      ],
    }).compile();

    controller = module.get<OrcamentoController>(OrcamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar inserção de orçamento', async () => {
    inserirOrcamentoUseCase.execute.mockResolvedValue({ id: 1 });

    const input = {
      nomeCliente: 'Eduardo',
      telefoneCliente: '21999999999',
      descricao: 'Peça decorativa',
      linkSTL: 'https://exemplo.com/modelo.stl',
    };

    const result = await controller.inserirOrcamento(input);

    expect(inserirOrcamentoUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 1 });
  });

  it('deve listar orçamentos', async () => {
    const response = {
      itens: [Object.assign(new Orcamento(), { id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    };
    orcamentoService.listarOrcamentos.mockResolvedValue(response);

    const result = await controller.listarOrcamentos({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(orcamentoService.listarOrcamentos).toHaveBeenCalledWith({
      pagina: 1,
      tamanhoPagina: 10,
    });
    expect(result).toBe(response);
  });
});
