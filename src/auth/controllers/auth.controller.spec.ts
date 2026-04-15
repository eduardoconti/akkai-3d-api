import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '@auth/controllers';
import { AuthService } from '@auth/services';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    register: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
    me: jest.Mock;
    listRoles: jest.Mock;
    updateProfile: jest.Mock;
    updatePassword: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      me: jest.fn(),
      listRoles: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  it('deve delegar login', async () => {
    const response = { cookie: jest.fn() };
    const body = { login: 'eduardo', password: '123456' };
    authService.login.mockResolvedValue({ id: 1 });

    const result = await controller.login(body, response as never);

    expect(authService.login).toHaveBeenCalledWith(body, response);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar registro', async () => {
    const response = { cookie: jest.fn() };
    const body = {
      name: 'Eduardo',
      login: 'eduardo',
      password: '123456',
    };
    authService.register.mockResolvedValue({ id: 1 });

    const result = await controller.register(body, response as never);

    expect(authService.register).toHaveBeenCalledWith(body, response);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar refresh com cookie', async () => {
    const request = { cookies: { refresh_token: 'token' } };
    const response = { cookie: jest.fn() };
    authService.refresh.mockResolvedValue({ id: 1 });

    const result = await controller.refresh(request, response as never);

    expect(authService.refresh).toHaveBeenCalledWith('token', response);
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar logout com cookie', async () => {
    const request = { cookies: { refresh_token: 'token' } };
    const response = { clearCookie: jest.fn() };

    await controller.logout(request, response as never);

    expect(authService.logout).toHaveBeenCalledWith('token', response);
  });

  it('deve retornar dados do usuário autenticado em me', async () => {
    authService.me.mockResolvedValue({ id: 1 });

    const result = await controller.me({
      user: {
        sub: 1,
        login: 'eduardo',
        role: 'user',
        permissions: [],
      },
    });

    expect(authService.me).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('deve lançar erro em me quando não houver usuário autenticado', async () => {
    await expect(controller.me({})).rejects.toThrow(
      new UnauthorizedException('Usuário não autenticado.'),
    );
  });

  it('deve listar papéis', async () => {
    authService.listRoles.mockResolvedValue([{ id: 1, name: 'user' }]);

    const result = await controller.listRoles();

    expect(authService.listRoles).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: 'user' }]);
  });

  it('deve delegar alteração de cadastro', async () => {
    const request = {
      user: {
        sub: 1,
        login: 'eduardo',
        role: 'user',
        permissions: [],
      },
    };
    const response = { cookie: jest.fn(), clearCookie: jest.fn() };
    const body = {
      name: 'Eduardo',
      login: 'eduardo',
      isActive: true,
      roleId: 1,
    };
    authService.updateProfile.mockResolvedValue({ id: 1 });

    const result = await controller.updateProfile(
      request,
      body,
      response as never,
    );

    expect(authService.updateProfile).toHaveBeenCalledWith(
      1,
      body,
      [],
      response,
    );
    expect(result).toEqual({ id: 1 });
  });

  it('deve delegar alteração de senha', async () => {
    const request = {
      user: {
        sub: 1,
        login: 'eduardo',
        role: 'user',
        permissions: [],
      },
    };
    const body = {
      currentPassword: '123456',
      newPassword: '654321',
    };

    await controller.updatePassword(request, body);

    expect(authService.updatePassword).toHaveBeenCalledWith(1, body);
  });

  it('deve lançar erro ao alterar cadastro sem usuário autenticado', async () => {
    await expect(
      controller.updateProfile(
        {},
        {
          name: 'Eduardo',
          login: 'eduardo',
          isActive: true,
          roleId: 1,
        },
        { cookie: jest.fn(), clearCookie: jest.fn() } as never,
      ),
    ).rejects.toThrow(new UnauthorizedException('Usuário não autenticado.'));
  });

  it('deve lançar erro ao alterar senha sem usuário autenticado', async () => {
    await expect(
      controller.updatePassword(
        {},
        {
          currentPassword: '123456',
          newPassword: '654321',
        },
      ),
    ).rejects.toThrow(new UnauthorizedException('Usuário não autenticado.'));
  });
});
