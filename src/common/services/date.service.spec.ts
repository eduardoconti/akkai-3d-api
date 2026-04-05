import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DateService } from './date.service';

describe('DateService', () => {
  function buildService(tzOffset: number): DateService {
    const configService = {
      get: jest.fn().mockReturnValue(tzOffset),
    } as unknown as ConfigService;
    return new DateService(configService);
  }

  it('deve usar offset zero quando APP_TZ_OFFSET for 0', () => {
    const service = buildService(0);
    const result = service.toUtcDateRange('2026-04-04');

    expect(result.start).toBe('2026-04-04 00:00:00.000');
    expect(result.end).toBe('2026-04-04 23:59:59.999');
  });

  it('deve converter para UTC com offset -3 (BRT)', () => {
    const service = buildService(-3);
    const result = service.toUtcDateRange('2026-04-04');

    expect(result.start).toBe('2026-04-04 03:00:00.000');
    expect(result.end).toBe('2026-04-05 02:59:59.999');
  });

  it('deve ser instanciável via NestJS DI', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DateService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(-3) },
        },
      ],
    }).compile();

    const service = module.get<DateService>(DateService);
    expect(service).toBeDefined();
    expect(service.toUtcDateRange('2026-04-04').start).toBe(
      '2026-04-04 03:00:00.000',
    );
  });
});
