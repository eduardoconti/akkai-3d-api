import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';
import { InserirFeiraInput, InserirFeiraUseCase } from '@venda/use-cases';

describe('InserirFeiraUseCase', () => {
  let useCase: InserirFeiraUseCase;
  let inserirFeiraMock: jest.MockedFunction<(feira: Feira) => Promise<Feira>>;

  beforeEach(() => {
    inserirFeiraMock = jest.fn<Promise<Feira>, [Feira]>();

    const feiraService = {
      inserirFeira: inserirFeiraMock,
    } as unknown as FeiraService;

    useCase = new InserirFeiraUseCase(feiraService);
  });

  it('deve inserir feira com ativa true por padrão', async () => {
    const input: InserirFeiraInput = {
      nome: 'Teatro Reviver',
      local: 'Niteroi',
      descricao: 'Todos os sabados',
    };
    const feira = Object.assign(new Feira(), {
      id: 1,
      nome: input.nome,
      local: input.local,
      descricao: input.descricao,
      ativa: true,
    });
    inserirFeiraMock.mockResolvedValue(feira);

    const result = await useCase.execute(input);

    expect(inserirFeiraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Teatro Reviver',
        local: 'Niteroi',
        descricao: 'Todos os sabados',
        ativa: true,
      }),
    );
    expect(result).toBe(feira);
  });

  it('deve respeitar valor de ativa informado', async () => {
    inserirFeiraMock.mockResolvedValue(Object.assign(new Feira(), { id: 1 }));

    await useCase.execute({
      nome: 'Feira da Maua',
      ativa: false,
    });

    expect(inserirFeiraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Feira da Maua',
        ativa: false,
      }),
    );
  });
});
