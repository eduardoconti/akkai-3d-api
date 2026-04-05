import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toUtcDateRange } from '../utils/date.util';

@Injectable()
export class DateService {
  private readonly tzOffset: number;

  constructor(configService: ConfigService) {
    this.tzOffset = configService.get<number>('APP_TZ_OFFSET', 0);
  }

  toUtcDateRange(dateStr: string): { start: string; end: string } {
    return toUtcDateRange(dateStr, this.tzOffset);
  }
}
