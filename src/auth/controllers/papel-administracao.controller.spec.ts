import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { PapelAdministracaoController } from '@auth/controllers';
import { PERMISSIONS_KEY } from '@auth/decorators/permissions.decorator';
import { PapelService } from '@auth/services';

describe('PapelAdministracaoController', () => {
  let controller: PapelAdministracaoController;
  let service: {
    listar: jest.Mock;
    criar: jest.Mock;
    atualizar: jest.Mock;
    excluir: jest.Mock;
  };
  const ator = { sub: 1, login: 'eduardo', role: 'admin', permissions: [] };
  const body = { name: 'vendedor', permissoes: ['venda.ler'] };

  beforeEach(() => {
    service = {
      listar: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      excluir: jest.fn(),
    };
    controller = new PapelAdministracaoController(
      service as unknown as PapelService,
    );
  });

  const permissoesDe = (metodo: keyof PapelAdministracaoController) =>
    new Reflector().get<string[]>(
      PERMISSIONS_KEY,
      PapelAdministracaoController.prototype[metodo],
    );

  it('deve exigir a permissão certa em cada rota', () => {
    expect(permissoesDe('listar')).toEqual([
      PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES,
    ]);
    for (const metodo of ['criar', 'atualizar', 'excluir'] as const) {
      expect(permissoesDe(metodo)).toEqual([PERMISSOES.PAPEL.ADMINISTRAR]);
    }
  });

  it('deve delegar a listagem', async () => {
    service.listar.mockResolvedValue([{ id: 1 }]);

    expect(await controller.listar()).toEqual([{ id: 1 }]);
  });

  it('deve criar repassando o usuário autenticado', async () => {
    service.criar.mockResolvedValue({ id: 3 });

    expect(await controller.criar(body, { user: ator })).toEqual({ id: 3 });
    expect(service.criar).toHaveBeenCalledWith(body, ator);
  });

  it('deve atualizar repassando o usuário autenticado', async () => {
    service.atualizar.mockResolvedValue({ id: 3 });

    expect(await controller.atualizar(3, body, { user: ator })).toEqual({
      id: 3,
    });
    expect(service.atualizar).toHaveBeenCalledWith(3, body, ator);
  });

  it('deve delegar a exclusão', async () => {
    await controller.excluir(3);

    expect(service.excluir).toHaveBeenCalledWith(3);
  });

  it('deve lançar UnauthorizedException sem usuário autenticado', async () => {
    await expect(controller.criar(body, {})).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(controller.atualizar(3, body, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
