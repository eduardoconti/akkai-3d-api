import { NotFoundException } from '@nestjs/common';
import { ItemKitMensal, KitMensal } from '@assinatura/entities';
import { KitMensalService } from '@assinatura/services';
import { AlterarKitMensalUseCase } from '@assinatura/use-cases';

describe('AlterarKitMensalUseCase', () => {
  let useCase: AlterarKitMensalUseCase;
  let garantirKitPorIdMock: jest.MockedFunction<(id: number) => Promise<KitMensal>>;
  let atualizarItensKitMock: jest.MockedFunction<
    (kit: KitMensal, itens: ItemKitMensal[]) => Promise<KitMensal>
  >;

  beforeEach(() => {
    garantirKitPorIdMock = jest.fn<Promise<KitMensal>, [number]>();
    atualizarItensKitMock = jest.fn<Promise<KitMensal>, [KitMensal, ItemKitMensal[]]>();

    const kitMensalService = {
      garantirKitPorId: garantirKitPorIdMock,
      atualizarItensKit: atualizarItensKitMock,
    } as unknown as KitMensalService;

    useCase = new AlterarKitMensalUseCase(kitMensalService);
  });

  it('deve alterar os itens do kit quando existe', async () => {
    const kit = Object.assign(new KitMensal(), { id: 1, itens: [] });
    const kitAtualizado = Object.assign(new KitMensal(), {
      ...kit,
      itens: [Object.assign(new ItemKitMensal(), { nomeProduto: 'Caneca', quantidade: 1 })],
    });

    garantirKitPorIdMock.mockResolvedValue(kit);
    atualizarItensKitMock.mockResolvedValue(kitAtualizado);

    const result = await useCase.execute({
      id: 1,
      itens: [{ nomeProduto: 'Caneca', quantidade: 1 }],
    });

    expect(garantirKitPorIdMock).toHaveBeenCalledWith(1);
    expect(atualizarItensKitMock).toHaveBeenCalledWith(
      kit,
      expect.arrayContaining([
        expect.objectContaining({ nomeProduto: 'Caneca', quantidade: 1 }),
      ]),
    );
    expect(result).toBe(kitAtualizado);
  });

  it('deve mapear os itens usando ItemKitMensal.criar', async () => {
    const kit = Object.assign(new KitMensal(), { id: 1, itens: [] });
    atualizarItensKitMock.mockResolvedValue(kit);
    garantirKitPorIdMock.mockResolvedValue(kit);

    await useCase.execute({
      id: 1,
      itens: [
        { nomeProduto: 'Vaso', quantidade: 2, observacao: 'Delicado' },
        { nomeProduto: 'Caneca', quantidade: 1 },
      ],
    });

    const itensPassados = atualizarItensKitMock.mock.calls[0]![1];
    expect(itensPassados).toHaveLength(2);
    expect(itensPassados[0]).toBeInstanceOf(ItemKitMensal);
    expect(itensPassados[0]!.observacao).toBe('Delicado');
    expect(itensPassados[1]!.observacao).toBeUndefined();
  });

  it('deve lançar NotFoundException quando o kit não existe', async () => {
    garantirKitPorIdMock.mockRejectedValue(
      new NotFoundException('Kit mensal com ID 99 não encontrado.'),
    );

    await expect(
      useCase.execute({ id: 99, itens: [] }),
    ).rejects.toThrow(NotFoundException);

    expect(atualizarItensKitMock).not.toHaveBeenCalled();
  });
});
