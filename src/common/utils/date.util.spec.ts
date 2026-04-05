import { toUtcDateRange } from './date.util';

describe('toUtcDateRange', () => {
  it('deve retornar o dia completo em UTC quando offset for 0', () => {
    const result = toUtcDateRange('2026-04-04', 0);

    expect(result.start).toBe('2026-04-04 00:00:00.000');
    expect(result.end).toBe('2026-04-04 23:59:59.999');
  });

  it('deve deslocar o intervalo para UTC quando offset for negativo (UTC-3)', () => {
    const result = toUtcDateRange('2026-04-04', -3);

    expect(result.start).toBe('2026-04-04 03:00:00.000');
    expect(result.end).toBe('2026-04-05 02:59:59.999');
  });

  it('deve deslocar o intervalo para UTC quando offset for positivo (UTC+5:30)', () => {
    const result = toUtcDateRange('2026-04-04', 5.5);

    expect(result.start).toBe('2026-04-03 18:30:00.000');
    expect(result.end).toBe('2026-04-04 18:29:59.999');
  });

  it('deve cobrir virada de mês corretamente', () => {
    const result = toUtcDateRange('2026-03-31', -3);

    expect(result.start).toBe('2026-03-31 03:00:00.000');
    expect(result.end).toBe('2026-04-01 02:59:59.999');
  });

  it('deve cobrir virada de ano corretamente', () => {
    const result = toUtcDateRange('2026-12-31', -3);

    expect(result.start).toBe('2026-12-31 03:00:00.000');
    expect(result.end).toBe('2027-01-01 02:59:59.999');
  });
});
