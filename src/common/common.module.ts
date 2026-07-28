import { Global, Module } from '@nestjs/common';
import { ContextoUsuario } from './contracts';
import { CurrentUserContext } from './services/current-user-context.service';
import { DateService } from './services/date.service';

@Global()
@Module({
  providers: [
    DateService,
    CurrentUserContext,
    {
      provide: ContextoUsuario,
      useExisting: CurrentUserContext,
    },
  ],
  exports: [DateService, CurrentUserContext, ContextoUsuario],
})
export class CommonModule {}
