import { Global, Module } from '@nestjs/common';
import { CurrentUserContext } from './services/current-user-context.service';
import { DateService } from './services/date.service';

@Global()
@Module({
  providers: [DateService, CurrentUserContext],
  exports: [DateService, CurrentUserContext],
})
export class CommonModule {}
