import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';
import { AlterarFeiraUseCase } from '@venda/use-cases';

describe('AlterarFeiraUseCase', () => {
  let useCase: AlterarFeiraUseCase;
  let garantirFeiraPorIdMock: jest.MockedFunction<
    (id: number) => Promise<Feira>
  >;
  let salvarFeiraMock: jest.MockedFunction<(feira: Feira) => Promise<Feira>>;

  beforeEach(() => {
    garantirFeiraPorIdMock = jest.fn<Promise<Feira>, [number]>();
    salvarFeiraMock = jest.fn<Promise<Feira>, [Feira]>();

    const feiraService = {
      garantirFeiraPorId: garantirFeiraPorIdMock,
      salvarFeira: salvarFeiraMock,
    } as unknown as FeiraService;

    useCase = new AlterarFeiraUseCase(feiraService);
  });

  it('deve alterar a feira com sucesso', async () => {
    const feira = Object.assign(new Feira(), {
      id: 2,
      nome: 'Feira Antiga',
      local: 'Centro',
      descricao: 'Anterior',
      ativa: false,
    });

    garantirFeiraPorIdMock.mockResolvedValue(feira);
    salvarFeiraMock.mockResolvedValue(feira);

    const result = await useCase.execute({
      id: 2,
      nome: 'Feira Nova',
      local: 'Praça',
      descricao: 'Atualizada',
      ativa: true,
    });

    expect(garantirFeiraPorIdMock).toHaveBeenCalledWith(2);
    expect(salvarFeiraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        nome: 'Feira Nova',
        local: 'Praça',
        descricao: 'Atualizada',
        ativa: true,
      }),
    );
    expect(result).toBe(feira);
  });

  it('deve manter a feira ativa por padrão quando ativa não for informado', async () => {
    const feira = Object.assign(new Feira(), {
      id: 3,
      nome: 'Feira Base',
      ativa: false,
    });

    garantirFeiraPorIdMock.mockResolvedValue(feira);
    salvarFeiraMock.mockResolvedValue(feira);

    await useCase.execute({
      id: 3,
      nome: 'Feira Base',
      local: undefined,
      descricao: undefined,
    });

    expect(salvarFeiraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ativa: true,
      }),
    );
  });
});
