import { InternalServerErrorException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AjusteCarteira, TipoAjusteCarteira } from '@financeiro/entities';
import { AjusteCarteiraService } from './ajuste-carteira.service';

describe('AjusteCarteiraService', () => {
  let service: AjusteCarteiraService;
  let ajusteCarteiraRepository: {
    save: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    ajusteCarteiraRepository = {
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AjusteCarteiraService,
        {
          provide: getRepositoryToken(AjusteCarteira),
          useValue: ajusteCarteiraRepository,
        },
      ],
    }).compile();

    service = module.get<AjusteCarteiraService>(AjusteCarteiraService);
  });

  it('deve inserir ajuste de carteira', async () => {
    const ajuste = Object.assign(new AjusteCarteira(), {
      idCarteira: 1,
      tipo: TipoAjusteCarteira.CREDITO,
      valor: 5000,
    });
    const ajustePersistido = Object.assign(new AjusteCarteira(), {
      ...ajuste,
      id: 1,
    });
    ajusteCarteiraRepository.save.mockResolvedValue(ajustePersistido);

    const result = await service.inserirAjusteCarteira(ajuste);

    expect(ajusteCarteiraRepository.save).toHaveBeenCalledWith(ajuste);
    expect(result).toBe(ajustePersistido);
  });

  it('deve lançar erro interno ao falhar inserção de ajuste', async () => {
    ajusteCarteiraRepository.save.mockRejectedValue(new Error('falha'));

    await expect(
      service.inserirAjusteCarteira(new AjusteCarteira()),
    ).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir ajuste de carteira'),
    );
  });

  it('deve listar ajustes por carteira ordenados pelos mais recentes', async () => {
    const ajustes = [Object.assign(new AjusteCarteira(), { id: 1 })];
    ajusteCarteiraRepository.find.mockResolvedValue(ajustes);

    const result = await service.listarAjustesPorCarteira(3);

    expect(ajusteCarteiraRepository.find).toHaveBeenCalledWith({
      where: { idCarteira: 3 },
      order: { dataAjuste: 'DESC', id: 'DESC' },
    });
    expect(result).toBe(ajustes);
  });
});
