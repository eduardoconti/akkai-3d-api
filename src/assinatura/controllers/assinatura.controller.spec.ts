import { Test, TestingModule } from '@nestjs/testing';
import {
  Assinante,
  CicloAssinatura,
  KitMensal,
  PlanoAssinatura,
  StatusAssinante,
  StatusCiclo,
} from '@assinatura/entities';
import {
  AssinanteService,
  CicloService,
  KitMensalService,
  PlanoService,
} from '@assinatura/services';
import {
  AlterarAssinanteUseCase,
  AlterarCicloUseCase,
  AlterarKitMensalUseCase,
  AlterarPlanoUseCase,
  ExcluirAssinanteUseCase,
  ExcluirCicloUseCase,
  ExcluirKitMensalUseCase,
  ExcluirPlanoUseCase,
  GerarCiclosMensaisUseCase,
  InserirAssinanteUseCase,
  InserirCicloUseCase,
  InserirKitMensalUseCase,
  InserirPlanoUseCase,
} from '@assinatura/use-cases';
import { AssinaturaController } from '@assinatura/controllers';

describe('AssinaturaController', () => {
  let controller: AssinaturaController;

  let planoService: {
    listarPlanos: jest.Mock;
    pesquisarPlanos: jest.Mock;
    garantirPlanoPorId: jest.Mock;
  };
  let assinanteService: {
    pesquisarAssinantes: jest.Mock;
    garantirAssinantePorId: jest.Mock;
  };
  let cicloService: {
    pesquisarCiclos: jest.Mock;
    garantirCicloPorId: jest.Mock;
  };
  let kitMensalService: {
    pesquisarKits: jest.Mock;
    garantirKitPorId: jest.Mock;
  };

  let inserirPlanoUseCase: { execute: jest.Mock };
  let alterarPlanoUseCase: { execute: jest.Mock };
  let excluirPlanoUseCase: { execute: jest.Mock };
  let inserirAssinanteUseCase: { execute: jest.Mock };
  let alterarAssinanteUseCase: { execute: jest.Mock };
  let excluirAssinanteUseCase: { execute: jest.Mock };
  let inserirCicloUseCase: { execute: jest.Mock };
  let alterarCicloUseCase: { execute: jest.Mock };
  let excluirCicloUseCase: { execute: jest.Mock };
  let inserirKitMensalUseCase: { execute: jest.Mock };
  let alterarKitMensalUseCase: { execute: jest.Mock };
  let excluirKitMensalUseCase: { execute: jest.Mock };
  let gerarCiclosMensaisUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    planoService = {
      listarPlanos: jest.fn(),
      pesquisarPlanos: jest.fn(),
      garantirPlanoPorId: jest.fn(),
    };
    assinanteService = {
      pesquisarAssinantes: jest.fn(),
      garantirAssinantePorId: jest.fn(),
    };
    cicloService = {
      pesquisarCiclos: jest.fn(),
      garantirCicloPorId: jest.fn(),
    };
    kitMensalService = {
      pesquisarKits: jest.fn(),
      garantirKitPorId: jest.fn(),
    };

    inserirPlanoUseCase = { execute: jest.fn() };
    alterarPlanoUseCase = { execute: jest.fn() };
    excluirPlanoUseCase = { execute: jest.fn() };
    inserirAssinanteUseCase = { execute: jest.fn() };
    alterarAssinanteUseCase = { execute: jest.fn() };
    excluirAssinanteUseCase = { execute: jest.fn() };
    inserirCicloUseCase = { execute: jest.fn() };
    alterarCicloUseCase = { execute: jest.fn() };
    excluirCicloUseCase = { execute: jest.fn() };
    inserirKitMensalUseCase = { execute: jest.fn() };
    alterarKitMensalUseCase = { execute: jest.fn() };
    excluirKitMensalUseCase = { execute: jest.fn() };
    gerarCiclosMensaisUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssinaturaController],
      providers: [
        { provide: PlanoService, useValue: planoService },
        { provide: AssinanteService, useValue: assinanteService },
        { provide: CicloService, useValue: cicloService },
        { provide: KitMensalService, useValue: kitMensalService },
        { provide: InserirPlanoUseCase, useValue: inserirPlanoUseCase },
        { provide: AlterarPlanoUseCase, useValue: alterarPlanoUseCase },
        { provide: ExcluirPlanoUseCase, useValue: excluirPlanoUseCase },
        { provide: InserirAssinanteUseCase, useValue: inserirAssinanteUseCase },
        { provide: AlterarAssinanteUseCase, useValue: alterarAssinanteUseCase },
        { provide: ExcluirAssinanteUseCase, useValue: excluirAssinanteUseCase },
        { provide: InserirCicloUseCase, useValue: inserirCicloUseCase },
        { provide: AlterarCicloUseCase, useValue: alterarCicloUseCase },
        { provide: ExcluirCicloUseCase, useValue: excluirCicloUseCase },
        { provide: InserirKitMensalUseCase, useValue: inserirKitMensalUseCase },
        { provide: AlterarKitMensalUseCase, useValue: alterarKitMensalUseCase },
        { provide: ExcluirKitMensalUseCase, useValue: excluirKitMensalUseCase },
        {
          provide: GerarCiclosMensaisUseCase,
          useValue: gerarCiclosMensaisUseCase,
        },
      ],
    }).compile();

    controller = module.get<AssinaturaController>(AssinaturaController);
  });

  // ─── Planos ───────────────────────────────────────────────────────────────

  describe('inserirPlano', () => {
    it('deve delegar ao InserirPlanoUseCase', async () => {
      const plano = Object.assign(new PlanoAssinatura(), {
        id: 1,
        nome: 'Básico',
        valor: 4990,
      });
      inserirPlanoUseCase.execute.mockResolvedValue(plano);

      const result = await controller.inserirPlano({
        nome: 'Básico',
        valor: 4990,
        ativo: true,
      });

      expect(inserirPlanoUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Básico', valor: 4990, ativo: true }),
      );
      expect(result).toBe(plano);
    });

    it('deve usar ativo=true como padrão quando não informado', async () => {
      inserirPlanoUseCase.execute.mockResolvedValue(new PlanoAssinatura());

      await controller.inserirPlano({ nome: 'X', valor: 1000 } as never);

      expect(inserirPlanoUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ ativo: true }),
      );
    });
  });

  describe('listarPlanos', () => {
    it('deve delegar ao PlanoService', async () => {
      const planos = [new PlanoAssinatura()];
      planoService.listarPlanos.mockResolvedValue(planos);

      const result = await controller.listarPlanos();

      expect(planoService.listarPlanos).toHaveBeenCalled();
      expect(result).toBe(planos);
    });
  });

  describe('pesquisarPlanos', () => {
    it('deve delegar ao PlanoService com parâmetros de pesquisa', async () => {
      const resposta = {
        itens: [],
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 0,
        totalPaginas: 1,
      };
      planoService.pesquisarPlanos.mockResolvedValue(resposta);
      const pesquisa = { pagina: 1, tamanhoPagina: 10 };

      const result = await controller.pesquisarPlanos(pesquisa);

      expect(planoService.pesquisarPlanos).toHaveBeenCalledWith(pesquisa);
      expect(result).toBe(resposta);
    });
  });

  describe('obterPlanoPorId', () => {
    it('deve delegar ao PlanoService', async () => {
      const plano = Object.assign(new PlanoAssinatura(), { id: 1 });
      planoService.garantirPlanoPorId.mockResolvedValue(plano);

      const result = await controller.obterPlanoPorId(1);

      expect(planoService.garantirPlanoPorId).toHaveBeenCalledWith(1);
      expect(result).toBe(plano);
    });
  });

  describe('alterarPlano', () => {
    it('deve delegar ao AlterarPlanoUseCase com id e body', async () => {
      const plano = new PlanoAssinatura();
      alterarPlanoUseCase.execute.mockResolvedValue(plano);

      const result = await controller.alterarPlano(1, {
        nome: 'Premium',
        valor: 9990,
        ativo: true,
      });

      expect(alterarPlanoUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, nome: 'Premium' }),
      );
      expect(result).toBe(plano);
    });
  });

  describe('excluirPlano', () => {
    it('deve delegar ao ExcluirPlanoUseCase', async () => {
      excluirPlanoUseCase.execute.mockResolvedValue(undefined);

      await controller.excluirPlano(1);

      expect(excluirPlanoUseCase.execute).toHaveBeenCalledWith({ id: 1 });
    });
  });

  // ─── Assinantes ────────────────────────────────────────────────────────────

  describe('inserirAssinante', () => {
    it('deve delegar ao InserirAssinanteUseCase', async () => {
      const assinante = Object.assign(new Assinante(), { id: 1 });
      inserirAssinanteUseCase.execute.mockResolvedValue(assinante);

      const result = await controller.inserirAssinante({
        nome: 'João',
        idPlano: 1,
        status: StatusAssinante.ATIVO,
      });

      expect(inserirAssinanteUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'João', idPlano: 1 }),
      );
      expect(result).toBe(assinante);
    });

    it('deve usar status ATIVO como padrão quando não informado', async () => {
      inserirAssinanteUseCase.execute.mockResolvedValue(new Assinante());

      await controller.inserirAssinante({ nome: 'X', idPlano: 1 } as never);

      expect(inserirAssinanteUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusAssinante.ATIVO }),
      );
    });
  });

  describe('pesquisarAssinantes', () => {
    it('deve delegar ao AssinanteService', async () => {
      const resposta = {
        itens: [],
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 0,
        totalPaginas: 1,
      };
      assinanteService.pesquisarAssinantes.mockResolvedValue(resposta);
      const pesquisa = { pagina: 1, tamanhoPagina: 10 };

      const result = await controller.pesquisarAssinantes(pesquisa);

      expect(assinanteService.pesquisarAssinantes).toHaveBeenCalledWith(
        pesquisa,
      );
      expect(result).toBe(resposta);
    });
  });

  describe('obterAssinantePorId', () => {
    it('deve delegar ao AssinanteService', async () => {
      const assinante = Object.assign(new Assinante(), { id: 5 });
      assinanteService.garantirAssinantePorId.mockResolvedValue(assinante);

      const result = await controller.obterAssinantePorId(5);

      expect(assinanteService.garantirAssinantePorId).toHaveBeenCalledWith(5);
      expect(result).toBe(assinante);
    });
  });

  describe('alterarAssinante', () => {
    it('deve delegar ao AlterarAssinanteUseCase com id e body', async () => {
      const assinante = new Assinante();
      alterarAssinanteUseCase.execute.mockResolvedValue(assinante);

      const result = await controller.alterarAssinante(3, {
        nome: 'Maria',
        idPlano: 2,
        status: StatusAssinante.PAUSADO,
      });

      expect(alterarAssinanteUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 3, nome: 'Maria', idPlano: 2 }),
      );
      expect(result).toBe(assinante);
    });
  });

  describe('excluirAssinante', () => {
    it('deve delegar ao ExcluirAssinanteUseCase', async () => {
      excluirAssinanteUseCase.execute.mockResolvedValue(undefined);

      await controller.excluirAssinante(3);

      expect(excluirAssinanteUseCase.execute).toHaveBeenCalledWith({ id: 3 });
    });
  });

  // ─── Ciclos ────────────────────────────────────────────────────────────────

  describe('inserirCiclo', () => {
    it('deve delegar ao InserirCicloUseCase', async () => {
      const ciclo = Object.assign(new CicloAssinatura(), { id: 1 });
      inserirCicloUseCase.execute.mockResolvedValue(ciclo);

      const result = await controller.inserirCiclo({
        idAssinante: 1,
        mesReferencia: 4,
        anoReferencia: 2026,
        status: StatusCiclo.PENDENTE,
        itens: [],
      });

      expect(inserirCicloUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          idAssinante: 1,
          mesReferencia: 4,
          anoReferencia: 2026,
        }),
      );
      expect(result).toBe(ciclo);
    });

    it('deve usar status PENDENTE como padrão quando não informado', async () => {
      inserirCicloUseCase.execute.mockResolvedValue(new CicloAssinatura());

      await controller.inserirCiclo({
        idAssinante: 1,
        mesReferencia: 4,
        anoReferencia: 2026,
        itens: [],
      } as never);

      expect(inserirCicloUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusCiclo.PENDENTE }),
      );
    });
  });

  describe('pesquisarCiclos', () => {
    it('deve delegar ao CicloService', async () => {
      const resposta = {
        itens: [],
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 0,
        totalPaginas: 1,
      };
      cicloService.pesquisarCiclos.mockResolvedValue(resposta);
      const pesquisa = { pagina: 1, tamanhoPagina: 10 };

      const result = await controller.pesquisarCiclos(pesquisa);

      expect(cicloService.pesquisarCiclos).toHaveBeenCalledWith(pesquisa);
      expect(result).toBe(resposta);
    });
  });

  describe('obterCicloPorId', () => {
    it('deve delegar ao CicloService', async () => {
      const ciclo = Object.assign(new CicloAssinatura(), { id: 7 });
      cicloService.garantirCicloPorId.mockResolvedValue(ciclo);

      const result = await controller.obterCicloPorId(7);

      expect(cicloService.garantirCicloPorId).toHaveBeenCalledWith(7);
      expect(result).toBe(ciclo);
    });
  });

  describe('alterarCiclo', () => {
    it('deve delegar ao AlterarCicloUseCase com id e body', async () => {
      const ciclo = new CicloAssinatura();
      alterarCicloUseCase.execute.mockResolvedValue(ciclo);

      const result = await controller.alterarCiclo(7, {
        status: StatusCiclo.ENVIADO,
        codigoRastreio: 'BR123',
        itens: [],
      });

      expect(alterarCicloUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, status: StatusCiclo.ENVIADO }),
      );
      expect(result).toBe(ciclo);
    });
  });

  describe('excluirCiclo', () => {
    it('deve delegar ao ExcluirCicloUseCase', async () => {
      excluirCicloUseCase.execute.mockResolvedValue(undefined);

      await controller.excluirCiclo(7);

      expect(excluirCicloUseCase.execute).toHaveBeenCalledWith({ id: 7 });
    });
  });

  // ─── Kits mensais ──────────────────────────────────────────────────────────

  describe('inserirKitMensal', () => {
    it('deve delegar ao InserirKitMensalUseCase', async () => {
      const kit = Object.assign(new KitMensal(), { id: 1 });
      inserirKitMensalUseCase.execute.mockResolvedValue(kit);

      const result = await controller.inserirKitMensal({
        idPlano: 1,
        mesReferencia: 4,
        anoReferencia: 2026,
        itens: [{ idProduto: 1, quantidade: 1 }],
      });

      expect(inserirKitMensalUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          idPlano: 1,
          mesReferencia: 4,
          anoReferencia: 2026,
        }),
      );
      expect(result).toBe(kit);
    });
  });

  describe('pesquisarKits', () => {
    it('deve delegar ao KitMensalService', async () => {
      const resposta = {
        itens: [],
        pagina: 1,
        tamanhoPagina: 10,
        totalItens: 0,
        totalPaginas: 1,
      };
      kitMensalService.pesquisarKits.mockResolvedValue(resposta);
      const pesquisa = { pagina: 1, tamanhoPagina: 10 };

      const result = await controller.pesquisarKits(pesquisa);

      expect(kitMensalService.pesquisarKits).toHaveBeenCalledWith(pesquisa);
      expect(result).toBe(resposta);
    });
  });

  describe('obterKitMensalPorId', () => {
    it('deve delegar ao KitMensalService', async () => {
      const kit = Object.assign(new KitMensal(), { id: 3 });
      kitMensalService.garantirKitPorId.mockResolvedValue(kit);

      const result = await controller.obterKitMensalPorId(3);

      expect(kitMensalService.garantirKitPorId).toHaveBeenCalledWith(3);
      expect(result).toBe(kit);
    });
  });

  describe('alterarKitMensal', () => {
    it('deve delegar ao AlterarKitMensalUseCase com id e itens', async () => {
      const kit = new KitMensal();
      alterarKitMensalUseCase.execute.mockResolvedValue(kit);

      const result = await controller.alterarKitMensal(3, {
        itens: [{ idProduto: 1, quantidade: 1 }],
      });

      expect(alterarKitMensalUseCase.execute).toHaveBeenCalledWith({
        id: 3,
        itens: [{ idProduto: 1, quantidade: 1 }],
      });
      expect(result).toBe(kit);
    });
  });

  describe('excluirKitMensal', () => {
    it('deve delegar ao ExcluirKitMensalUseCase', async () => {
      excluirKitMensalUseCase.execute.mockResolvedValue(undefined);

      await controller.excluirKitMensal(3);

      expect(excluirKitMensalUseCase.execute).toHaveBeenCalledWith({ id: 3 });
    });
  });

  describe('gerarCiclosMensais', () => {
    it('deve delegar ao GerarCiclosMensaisUseCase com o id do kit', async () => {
      gerarCiclosMensaisUseCase.execute.mockResolvedValue({
        criados: 50,
        ignorados: 10,
      });

      const result = await controller.gerarCiclosMensais(5);

      expect(gerarCiclosMensaisUseCase.execute).toHaveBeenCalledWith(5);
      expect(result).toEqual({ criados: 50, ignorados: 10 });
    });
  });
});
