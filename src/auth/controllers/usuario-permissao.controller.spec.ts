import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSOES } from '@auth/constants/permissoes.constants';
import { UsuarioPermissaoController } from '@auth/controllers';
import { PERMISSIONS_KEY } from '@auth/decorators/permissions.decorator';
import { PermissaoUsuarioService } from '@auth/services';

describe('UsuarioPermissaoController', () => {
  let controller: UsuarioPermissaoController;
  let service: {
    listarUsuarios: jest.Mock;
    listarPermissoes: jest.Mock;
    obterPermissoes: jest.Mock;
    definirPermissoes: jest.Mock;
  };

  beforeEach(() => {
    service = {
      listarUsuarios: jest.fn(),
      listarPermissoes: jest.fn(),
      obterPermissoes: jest.fn(),
      definirPermissoes: jest.fn(),
    };
    controller = new UsuarioPermissaoController(
      service as unknown as PermissaoUsuarioService,
    );
  });

  it('deve exigir a permissão de administrar permissões em todas as rotas', () => {
    const exigidas = new Reflector().get<string[]>(
      PERMISSIONS_KEY,
      UsuarioPermissaoController,
    );

    expect(exigidas).toEqual([PERMISSOES.USUARIO.ADMINISTRAR_PERMISSOES]);
  });

  it('deve delegar as listagens', async () => {
    service.listarUsuarios.mockResolvedValue([{ id: 1 }]);
    service.listarPermissoes.mockResolvedValue([{ name: 'venda.ler' }]);

    expect(await controller.listarUsuarios()).toEqual([{ id: 1 }]);
    expect(await controller.listarPermissoes()).toEqual([
      { name: 'venda.ler' },
    ]);
  });

  it('deve delegar a consulta das permissões de um usuário', async () => {
    service.obterPermissoes.mockResolvedValue({ id: 2 });

    expect(await controller.obterPermissoes(2)).toEqual({ id: 2 });
    expect(service.obterPermissoes).toHaveBeenCalledWith(2);
  });

  it('deve repassar o usuário autenticado ao definir permissões', async () => {
    const ator = { sub: 1, login: 'eduardo', role: 'admin', permissions: [] };
    const body = { idPapel: 1, permissoes: ['venda.ler'] };
    service.definirPermissoes.mockResolvedValue({ id: 2 });

    const resultado = await controller.definirPermissoes(2, body, {
      user: ator,
    });

    expect(service.definirPermissoes).toHaveBeenCalledWith(2, body, ator);
    expect(resultado).toEqual({ id: 2 });
  });

  it('deve lançar UnauthorizedException sem usuário autenticado', async () => {
    await expect(
      controller.definirPermissoes(2, { idPapel: 1, permissoes: [] }, {}),
    ).rejects.toThrow(UnauthorizedException);
  });
});
