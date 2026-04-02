import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { criarExcecaoValidacao } from './validation.exception-factory';

describe('criarExcecaoValidacao', () => {
  it('deve retornar BadRequestException com mensagem padrão', () => {
    const error = new ValidationError();
    error.property = 'nome';
    error.constraints = { isNotEmpty: 'nome não pode ser vazio' };
    error.children = [];

    const exception = criarExcecaoValidacao([error]);

    expect(exception).toBeInstanceOf(BadRequestException);
    const body = exception.getResponse() as Record<string, unknown>;
    expect(body['message']).toBe('Os dados informados são inválidos.');
  });

  it('deve extrair erros simples', () => {
    const error = new ValidationError();
    error.property = 'email';
    error.constraints = { isEmail: 'email deve ser válido' };
    error.children = [];

    const exception = criarExcecaoValidacao([error]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros).toEqual([
      { campo: 'email', mensagens: ['email deve ser válido'] },
    ]);
  });

  it('deve extrair múltiplos erros em um mesmo campo', () => {
    const error = new ValidationError();
    error.property = 'senha';
    error.constraints = {
      minLength: 'senha muito curta',
      matches: 'senha deve conter número',
    };
    error.children = [];

    const exception = criarExcecaoValidacao([error]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros[0]?.campo).toBe('senha');
    expect(body.erros[0]?.mensagens).toHaveLength(2);
  });

  it('deve extrair erros de campos filhos aninhados', () => {
    const child = new ValidationError();
    child.property = 'rua';
    child.constraints = { isNotEmpty: 'rua não pode ser vazio' };
    child.children = [];

    const parent = new ValidationError();
    parent.property = 'endereco';
    parent.constraints = {};
    parent.children = [child];

    const exception = criarExcecaoValidacao([parent]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros).toEqual([
      { campo: 'endereco.rua', mensagens: ['rua não pode ser vazio'] },
    ]);
  });

  it('deve tratar campo filho com índice numérico como array', () => {
    const child = new ValidationError();
    child.property = '0';
    child.constraints = { isNotEmpty: 'item não pode ser vazio' };
    child.children = [];

    const parent = new ValidationError();
    parent.property = 'itens';
    parent.constraints = {};
    parent.children = [child];

    const exception = criarExcecaoValidacao([parent]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros).toEqual([
      { campo: 'itens[0]', mensagens: ['item não pode ser vazio'] },
    ]);
  });

  it('deve traduzir mensagem "should not exist"', () => {
    const error = new ValidationError();
    error.property = 'campoDesconhecido';
    error.constraints = {
      whitelistValidation: 'campoDesconhecido should not exist',
    };
    error.children = [];

    const exception = criarExcecaoValidacao([error]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros[0]?.mensagens[0]).toBe(
      'O campo "campoDesconhecido" não é permitido.',
    );
  });

  it('deve retornar lista vazia de erros quando não há constraints', () => {
    const error = new ValidationError();
    error.property = 'campo';
    error.constraints = {};
    error.children = [];

    const exception = criarExcecaoValidacao([error]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros).toEqual([]);
  });

  it('deve processar lista vazia de erros', () => {
    const exception = criarExcecaoValidacao([]);
    const body = exception.getResponse() as {
      erros: Array<{ campo: string; mensagens: string[] }>;
    };

    expect(body.erros).toEqual([]);
  });
});
