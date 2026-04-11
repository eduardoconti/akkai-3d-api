import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserContext {
  constructor(
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  get usuarioId(): number {
    if (!this.request.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return this.request.user.sub;
  }
}
