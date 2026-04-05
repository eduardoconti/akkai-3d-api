/**
 * Converte uma string de data local (ex: '2026-04-04') em um intervalo UTC
 * equivalente ao dia completo no timezone da aplicação.
 *
 * Exemplo com tzOffset = -3 (BRT):
 *   '2026-04-04' → { start: '2026-04-04 03:00:00.000', end: '2026-04-05 02:59:59.999' }
 *
 * Isso garante que filtros por data respeitem o dia local do usuário mesmo que
 * os timestamps estejam armazenados em UTC no banco.
 */
export function toUtcDateRange(
  dateStr: string,
  tzOffset: number,
): { start: string; end: string } {
  const offsetMs = tzOffset * 60 * 60 * 1000;

  const start = new Date(
    new Date(`${dateStr}T00:00:00.000Z`).getTime() - offsetMs,
  );
  const end = new Date(
    new Date(`${dateStr}T23:59:59.999Z`).getTime() - offsetMs,
  );

  return {
    start: start.toISOString().replace('T', ' ').slice(0, 23),
    end: end.toISOString().replace('T', ' ').slice(0, 23),
  };
}
