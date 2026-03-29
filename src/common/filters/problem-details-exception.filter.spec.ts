import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ProblemDetailsExceptionFilter } from './problem-details-exception.filter';

describe('ProblemDetailsExceptionFilter', () => {
  let filter: ProblemDetailsExceptionFilter;
  let response: {
    status: jest.Mock;
    contentType: jest.Mock;
    send: jest.Mock;
  };
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new ProblemDetailsExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      contentType: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({
          originalUrl: '/venda',
          url: '/venda',
        }),
      }),
    } as ArgumentsHost;
  });

  it('deve retornar erro de validacao no padrao rfc7807', () => {
    const exception = new BadRequestException({
      message: 'Os dados informados são inválidos.',
      erros: [
        {
          campo: 'nome',
          mensagens: ['O nome é obrigatório.'],
        },
      ],
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.contentType).toHaveBeenCalledWith(
      'application/problem+json',
    );
    expect(response.send).toHaveBeenCalledWith({
      type: 'https://httpstatuses.com/400',
      title: 'Bad Request',
      status: 400,
      detail: 'Os dados informados são inválidos.',
      instance: '/venda',
      errors: [
        {
          campo: 'nome',
          mensagens: ['O nome é obrigatório.'],
        },
      ],
    });
  });

  it('deve retornar erro interno no padrao rfc7807 para excecoes nao tratadas', () => {
    filter.catch(new Error('falha inesperada'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.contentType).toHaveBeenCalledWith(
      'application/problem+json',
    );
    expect(response.send).toHaveBeenCalledWith({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Ocorreu um erro interno no servidor.',
      instance: '/venda',
    });
  });
});
