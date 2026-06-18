import { BadRequestException } from '@nestjs/common';
import { Orcamento, StatusOrcamento, TipoOrcamento } from '@orcamento/entities';

describe('Orcamento', () => {
  it('deve finalizar orçamento válido', () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 5,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.APROVADO,
    });

    orcamento.finalizar();

    expect(orcamento.status).toBe(StatusOrcamento.FINALIZADO);
  });

  it('deve impedir finalizar orçamento já finalizado', () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 5,
      tipo: TipoOrcamento.LOJA,
      status: StatusOrcamento.FINALIZADO,
    });

    expect(() => orcamento.finalizar()).toThrow(BadRequestException);
  });
});
