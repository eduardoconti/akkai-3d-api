import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toUtcDateRange } from '@common/utils/date.util';

@Injectable()
export class DateService {
  private readonly tzOffset: number;

  constructor(configService: ConfigService) {
    this.tzOffset = configService.get<number>('APP_TZ_OFFSET', 0);
  }

  toUtcDateRange(dateStr: string): { start: string; end: string } {
    return toUtcDateRange(dateStr, this.tzOffset);
  }

  obterAnoMesAtualLocal(data: Date = new Date()): { ano: number; mes: number } {
    const dataLocal = new Date(data.getTime() + this.tzOffset * 60 * 60 * 1000);

    return {
      ano: dataLocal.getUTCFullYear(),
      mes: dataLocal.getUTCMonth() + 1,
    };
  }

  obterIntervaloUtcMes(
    ano: number,
    mes: number,
  ): { start: string; end: string } {
    const mesFormatado = String(mes).padStart(2, '0');
    const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const dataInicio = `${ano}-${mesFormatado}-01`;
    const dataFim = `${ano}-${mesFormatado}-${String(ultimoDia).padStart(
      2,
      '0',
    )}`;
    const rangeInicio = this.toUtcDateRange(dataInicio);
    const rangeFim = this.toUtcDateRange(dataFim);

    return {
      start: rangeInicio.start,
      end: rangeFim.end,
    };
  }
}
