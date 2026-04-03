import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export function lancarExcecaoConflito(
  error: unknown,
  mensagemConflito: string,
  mensagemErro: string,
): never {
  const driverError = (error as { driverError?: { code?: string } })
    .driverError;
  if (driverError?.code === '23505') {
    throw new ConflictException(mensagemConflito);
  }
  throw new InternalServerErrorException(mensagemErro);
}
