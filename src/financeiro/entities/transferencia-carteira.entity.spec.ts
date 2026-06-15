import { TransferenciaCarteira } from './transferencia-carteira.entity';

describe('TransferenciaCarteira', () => {
  it('deve criar transferência com os dados informados', () => {
    const transferencia = TransferenciaCarteira.criar({
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
      dataTransferencia: '2026-06-10',
      idUsuarioInclusao: 9,
    });

    expect(transferencia).toMatchObject({
      idCarteiraOrigem: 1,
      idCarteiraDestino: 2,
      valor: 10000,
      idUsuarioInclusao: 9,
    });
    expect(transferencia.dataTransferencia).toEqual(new Date('2026-06-10'));
  });
});
