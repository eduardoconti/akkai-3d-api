import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CanalAtendimentoOrcamento,
  StatusOrcamento,
  TipoOrcamento,
} from '@orcamento/entities';
import { PesquisarOrcamentosDto } from './pesquisar-orcamentos.dto';

describe('PesquisarOrcamentosDto', () => {
  it.each([
    [StatusOrcamento.PENDENTE, [StatusOrcamento.PENDENTE]],
    [
      `${StatusOrcamento.PENDENTE}, ${StatusOrcamento.APROVADO}`,
      [StatusOrcamento.PENDENTE, StatusOrcamento.APROVADO],
    ],
    [
      [StatusOrcamento.PENDENTE, ` ${StatusOrcamento.APROVADO} `, ''],
      [StatusOrcamento.PENDENTE, StatusOrcamento.APROVADO],
    ],
  ])(
    'deve normalizar o filtro de status recebido como %p',
    (status, esperado) => {
      const dto = plainToInstance(PesquisarOrcamentosDto, { status });

      expect(dto.status).toEqual(esperado);
    },
  );

  it.each([undefined, null, ''])(
    'deve tratar %p como ausência do filtro de status',
    (status) => {
      const dto = plainToInstance(PesquisarOrcamentosDto, { status });

      expect(dto.status).toBeUndefined();
    },
  );

  it('deve rejeitar status desconhecido depois da normalização', async () => {
    const dto = plainToInstance(PesquisarOrcamentosDto, {
      status: 'PENDENTE,DESCONHECIDO',
    });

    const erros = await validate(dto);
    const erroStatus = erros.find((erro) => erro.property === 'status');

    expect(erroStatus?.constraints?.['isEnum']).toBe(
      'Cada status informado deve ser um status de orçamento válido.',
    );
  });

  it('deve preservar os demais filtros válidos', async () => {
    const dto = plainToInstance(PesquisarOrcamentosDto, {
      pagina: '2',
      tamanhoPagina: '25',
      tipo: TipoOrcamento.ONLINE,
      canalAtendimento: CanalAtendimentoOrcamento.WPP,
    });

    const erros = await validate(dto);

    expect(erros).toHaveLength(0);
    expect(dto).toEqual(
      expect.objectContaining({
        pagina: 2,
        tamanhoPagina: 25,
        tipo: TipoOrcamento.ONLINE,
        canalAtendimento: CanalAtendimentoOrcamento.WPP,
      }),
    );
  });
});
