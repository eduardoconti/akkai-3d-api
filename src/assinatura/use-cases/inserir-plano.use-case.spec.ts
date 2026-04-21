import { PlanoAssinatura, PlanoAssinaturaInput } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';
import { InserirPlanoUseCase } from '@assinatura/use-cases';

describe('InserirPlanoUseCase', () => {
  let useCase: InserirPlanoUseCase;
  let salvarPlanoMock: jest.MockedFunction<
    (plano: PlanoAssinatura) => Promise<PlanoAssinatura>
  >;

  beforeEach(() => {
    salvarPlanoMock = jest.fn<Promise<PlanoAssinatura>, [PlanoAssinatura]>();

    const planoService = {
      salvarPlano: salvarPlanoMock,
    } as unknown as PlanoService;

    useCase = new InserirPlanoUseCase(planoService);
  });

  it('deve criar e salvar o plano com os dados fornecidos', async () => {
    const input: PlanoAssinaturaInput = {
      nome: 'Plano Básico',
      descricao: 'Desc',
      valor: 4990,
      ativo: true,
    };
    const planoSalvo = Object.assign(new PlanoAssinatura(), {
      id: 1,
      ...input,
    });
    salvarPlanoMock.mockResolvedValue(planoSalvo);

    const result = await useCase.execute(input);

    expect(salvarPlanoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Plano Básico',
        valor: 4990,
        ativo: true,
      }),
    );
    expect(result).toBe(planoSalvo);
  });

  it('deve propagar erro do serviço ao falhar', async () => {
    salvarPlanoMock.mockRejectedValue(new Error('DB error'));

    await expect(
      useCase.execute({ nome: 'Plano', valor: 1000, ativo: true }),
    ).rejects.toThrow('DB error');
  });
});
