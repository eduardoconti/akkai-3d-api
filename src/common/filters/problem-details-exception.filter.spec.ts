import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

  it('deve usar o campo error do body como title quando presente', () => {
    const exception = new HttpException(
      { error: 'Custom Error Title', message: 'detalhe do erro' },
      HttpStatus.CONFLICT,
    );

    filter.catch(exception, host);

    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom Error Title',
        status: 409,
        detail: 'detalhe do erro',
      }),
    );
  });

  it('deve retornar detail quando message for array de strings', () => {
    const exception = new BadRequestException({
      message: ['campo1 é obrigatório', 'campo2 é inválido'],
    });

    filter.catch(exception, host);

    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'campo1 é obrigatório; campo2 é inválido',
      }),
    );
  });

  it('deve retornar detail padrão quando body for objeto sem message', () => {
    const exception = new HttpException(
      { error: 'Forbidden' },
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, host);

    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: 'A requisição não pôde ser processada.',
      }),
    );
  });

  it('deve usar url da requisicao quando originalUrl estiver vazio', () => {
    const hostSemOriginalUrl = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ originalUrl: '', url: '/fallback' }),
      }),
    } as ArgumentsHost;

    filter.catch(new Error('erro'), hostSemOriginalUrl);

    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({ instance: '/fallback' }),
    );
  });

  it('deve ignorar erros com campo erros invalido no body', () => {
    const exception = new BadRequestException({
      message: 'erro',
      erros: 'nao e um array',
    });

    filter.catch(exception, host);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sent = response.send.mock.calls[0][0] as Record<string, unknown>;
    expect(sent['errors']).toBeUndefined();
  });
});
