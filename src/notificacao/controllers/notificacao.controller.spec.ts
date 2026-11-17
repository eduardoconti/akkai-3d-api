import { Test, TestingModule } from '@nestjs/testing';
import { SeveridadeAlerta, TipoAlerta } from '@notificacao/enums';
import { ConsultarAlertasUseCase } from '@notificacao/use-cases';
import { NotificacaoController } from './notificacao.controller';

describe('NotificacaoController', () => {
  let controller: NotificacaoController;
  const consultarAlertasUseCase = { executar: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        {
          provide: ConsultarAlertasUseCase,
          useValue: consultarAlertasUseCase,
        },
      ],
    }).compile();

    controller = module.get(NotificacaoController);
  });

  it('deve listar os alertas com o total', async () => {
    const alerta = {
      tipo: TipoAlerta.ESTOQUE_NEGATIVO,
      severidade: SeveridadeAlerta.CRITICO,
      titulo: '1 produto com estoque negativo',
      descricao: '',
      quantidade: 1,
      chave: 'ESTOQUE_NEGATIVO:1:5',
      itens: [],
    };
    consultarAlertasUseCase.executar.mockResolvedValueOnce([alerta]);

    await expect(controller.listarAlertas()).resolves.toEqual({
      total: 1,
      alertas: [alerta],
    });
  });

  it('deve devolver lista vazia quando não há alertas', async () => {
    consultarAlertasUseCase.executar.mockResolvedValueOnce([]);

    await expect(controller.listarAlertas()).resolves.toEqual({
      total: 0,
      alertas: [],
    });
  });
});
