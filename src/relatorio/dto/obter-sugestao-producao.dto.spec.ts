import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ObterSugestaoProducaoDto } from '@relatorio/dto/obter-sugestao-producao.dto';

describe('ObterSugestaoProducaoDto', () => {
  const criarDto = (valores: Record<string, unknown>) =>
    plainToInstance(ObterSugestaoProducaoDto, valores);

  it('deve usar falso como padrão para apenasCoberturaInsuficiente', async () => {
    const dto = criarDto({});

    expect(dto.apenasCoberturaInsuficiente).toBe(false);
    expect(await validate(dto)).toHaveLength(0);
  });

  it.each([
    ['true', true],
    ['1', true],
    ['false', false],
    ['0', false],
  ])(
    'deve converter apenasCoberturaInsuficiente %p para %p',
    async (valor, esperado) => {
      const dto = criarDto({ apenasCoberturaInsuficiente: valor });

      expect(dto.apenasCoberturaInsuficiente).toBe(esperado);
      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it('deve rejeitar valor inválido para apenasCoberturaInsuficiente', async () => {
    const dto = criarDto({ apenasCoberturaInsuficiente: 'abc' });

    const erros = await validate(dto);

    expect(erros).toHaveLength(1);
    expect(erros[0]?.property).toBe('apenasCoberturaInsuficiente');
    expect(erros[0]?.constraints).toEqual({
      isBoolean:
        'O filtro de cobertura insuficiente deve ser verdadeiro ou falso.',
    });
  });
});
