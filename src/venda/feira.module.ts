import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultaFeira } from '@venda/contracts';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';

@Module({
  imports: [TypeOrmModule.forFeature([Feira])],
  providers: [
    FeiraService,
    {
      provide: ConsultaFeira,
      useExisting: FeiraService,
    },
  ],
  exports: [FeiraService, ConsultaFeira],
})
export class FeiraModule {}
