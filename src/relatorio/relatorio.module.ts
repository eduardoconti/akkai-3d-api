import { Module } from '@nestjs/common';
import { RelatorioController } from '@relatorio/controllers';
import { RelatorioService } from '@relatorio/services';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioService],
})
export class RelatorioModule {}
