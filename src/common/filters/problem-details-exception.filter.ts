import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ValidationErrorItem = {
  campo: string;
  mensagens: string[];
};

type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ValidationErrorItem[];
};

type HttpExceptionResponseBody =
  | string
  | {
      error?: string;
      message?: string | string[];
      erros?: ValidationErrorItem[];
      [key: string]: unknown;
    };

const PROBLEM_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
};

function isValidationErrorItemArray(
  value: unknown,
): value is ValidationErrorItem[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    const candidate = item as Record<string, unknown>;

    return (
      typeof candidate['campo'] === 'string' &&
      Array.isArray(candidate['mensagens']) &&
      candidate['mensagens'].every((mensagem) => typeof mensagem === 'string')
    );
  });
}

function getProblemTitle(
  status: number,
  responseBody: HttpExceptionResponseBody,
): string {
  if (typeof responseBody === 'object' && responseBody !== null) {
    const error = responseBody['error'];

    if (typeof error === 'string' && error.length > 0) {
      return error;
    }
  }

  return PROBLEM_TITLES[status] ?? 'Internal Server Error';
}

function getProblemDetail(
  responseBody: HttpExceptionResponseBody,
  status: number,
): string {
  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (responseBody !== null && typeof responseBody === 'object') {
    const message = responseBody['message'];

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message.join('; ');
    }
  }

  if (status === 500) {
    return 'Ocorreu um erro interno no servidor.';
  }

  return 'A requisição não pôde ser processada.';
}

function getValidationErrors(
  responseBody: HttpExceptionResponseBody,
): ValidationErrorItem[] | undefined {
  if (typeof responseBody !== 'object' || responseBody === null) {
    return undefined;
  }

  const erros = responseBody['erros'];

  return isValidationErrorItemArray(erros) ? erros : undefined;
}

function getProblemType(status: number): string {
  return `https://httpstatuses.com/${status}`;
}

@Catch()
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttpException
      ? (exception.getResponse() as HttpExceptionResponseBody)
      : 'Ocorreu um erro interno no servidor.';

    const problemDetails: ProblemDetails = {
      type: getProblemType(status),
      title: getProblemTitle(status, responseBody),
      status,
      detail: getProblemDetail(responseBody, status),
      instance: request.originalUrl || request.url,
    };

    const errors = getValidationErrors(responseBody);

    if (errors !== undefined) {
      problemDetails.errors = errors;
    }

    response
      .status(status)
      .contentType('application/problem+json')
      .send(problemDetails);
  }
}
