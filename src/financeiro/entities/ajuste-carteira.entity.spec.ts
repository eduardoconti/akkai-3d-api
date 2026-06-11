import {
  AjusteCarteira,
  CriarAjusteCarteiraInput,
  TipoAjusteCarteira,
} from './ajuste-carteira.entity';

describe('AjusteCarteira', () => {
  const input: CriarAjusteCarteiraInput = {
    idCarteira: 1,
    tipo: TipoAjusteCarteira.CREDITO,
    valor: 5000,
    dataAjuste: '2026-06-10',
    motivo: '  Correção de saldo  ',
    observacao: '  Conferência manual  ',
    idUsuarioInclusao: 7,
  };

  it('deve criar ajuste com os dados fornecidos', () => {
    const ajuste = AjusteCarteira.criar(input);

    expect(ajuste.idCarteira).toBe(1);
    expect(ajuste.tipo).toBe(TipoAjusteCarteira.CREDITO);
    expect(ajuste.valor).toBe(5000);
    expect(ajuste.dataAjuste).toEqual(new Date('2026-06-10'));
    expect(ajuste.motivo).toBe('Correção de saldo');
    expect(ajuste.observacao).toBe('Conferência manual');
    expect(ajuste.idUsuarioInclusao).toBe(7);
  });

  it('deve criar ajuste sem observação quando não informada', () => {
    const { observacao, ...semObservacao } = input;
    const ajuste = AjusteCarteira.criar(semObservacao);

    expect(ajuste.observacao).toBeUndefined();
  });
});
