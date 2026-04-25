import { Test, TestingModule } from '@nestjs/testing';
import { PlanoAssinatura } from '@assinatura/entities';
import { PublicAssinaturaController } from '@assinatura/controllers';
import { PlanoService, VitrineService } from '@assinatura/services';

describe('PublicAssinaturaController', () => {
  let controller: PublicAssinaturaController;
  let planoService: {
    listarPlanosAtivos: jest.Mock;
  };
  let vitrineService: {
    montarVitrine: jest.Mock;
  };

  beforeEach(async () => {
    planoService = {
      listarPlanosAtivos: jest.fn(),
    };
    vitrineService = {
      montarVitrine: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicAssinaturaController],
      providers: [
        { provide: PlanoService, useValue: planoService },
        { provide: VitrineService, useValue: vitrineService },
      ],
    }).compile();

    controller = module.get<PublicAssinaturaController>(
      PublicAssinaturaController,
    );
  });

  it('deve listar apenas os planos ativos do clube', async () => {
    const planos = [
      Object.assign(new PlanoAssinatura(), {
        id: 1,
        nome: 'Essencial',
        valor: 7990,
        ativo: true,
      }),
    ];
    planoService.listarPlanosAtivos.mockResolvedValue(planos);

    const result = await controller.listarPlanosAtivos();

    expect(planoService.listarPlanosAtivos).toHaveBeenCalled();
    expect(result).toBe(planos);
  });

  it('deve retornar a vitrine do clube', async () => {
    const vitrine = {
      planos: [],
      kitMensal: null,
    };
    vitrineService.montarVitrine.mockResolvedValue(vitrine);

    const result = await controller.obterVitrine();

    expect(vitrineService.montarVitrine).toHaveBeenCalled();
    expect(result).toBe(vitrine);
  });
});
