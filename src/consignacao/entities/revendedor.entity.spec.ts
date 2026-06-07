import { Revendedor, StatusRevendedor } from './revendedor.entity';

describe('Revendedor', () => {
  it('deve criar revendedor com desconto padrão zerado', () => {
    const revendedor = Revendedor.criar({
      nome: 'Loja Centro 3D',
      telefone: '(11) 99999-9999',
    });

    expect(revendedor).toMatchObject({
      nome: 'Loja Centro 3D',
      telefone: '(11) 99999-9999',
      status: StatusRevendedor.ATIVO,
      percentualDesconto: 0,
    });
  });

  it('deve atualizar o percentual de desconto informado', () => {
    const revendedor = Revendedor.criar({
      nome: 'Loja Centro 3D',
      telefone: '(11) 99999-9999',
      percentualDesconto: 15,
    });

    revendedor.atualizar({
      nome: 'Loja Centro 3D',
      telefone: '(11) 98888-7777',
      percentualDesconto: 20,
    });

    expect(revendedor.percentualDesconto).toBe(20);
  });
});
