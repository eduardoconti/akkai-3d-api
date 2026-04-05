import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Feira } from '@venda/entities';
import { FeiraService } from '@venda/services';

describe('FeiraService', () => {
  let service: FeiraService;
  let feiraRepository: {
    save: jest.Mock;
    exists: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    feiraRepository = {
      save: jest.fn(),
      exists: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeiraService,
        {
          provide: getRepositoryToken(Feira),
          useValue: feiraRepository,
        },
      ],
    }).compile();

    service = module.get<FeiraService>(FeiraService);
  });

  it('deve inserir feira com sucesso', async () => {
    const feira = Object.assign(new Feira(), { id: 1, nome: 'Feira de Natal' });
    feiraRepository.save.mockResolvedValue(feira);

    const result = await service.inserirFeira(feira);

    expect(feiraRepository.save).toHaveBeenCalledWith(feira);
    expect(result).toBe(feira);
  });

  it('deve lançar ConflictException ao inserir feira com nome duplicado', async () => {
    const feira = Object.assign(new Feira(), { nome: 'Feira de Natal' });
    feiraRepository.save.mockRejectedValue({ driverError: { code: '23505' } });

    await expect(service.inserirFeira(feira)).rejects.toThrow(
      new ConflictException('Feira Feira de Natal já existe'),
    );
  });

  it('deve lançar InternalServerErrorException ao falhar inserção da feira', async () => {
    const feira = Object.assign(new Feira(), { nome: 'Feira de Natal' });
    feiraRepository.save.mockRejectedValue(new Error('falha inesperada'));

    await expect(service.inserirFeira(feira)).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir feira'),
    );
  });

  it('deve verificar existência de feira', async () => {
    feiraRepository.exists.mockResolvedValue(true);

    const result = await service.existeFeira(1);

    expect(feiraRepository.exists).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(true);
  });

  it('deve não lançar erro quando feira existir em garantirExisteFeira', async () => {
    feiraRepository.exists.mockResolvedValue(true);

    await expect(service.garantirExisteFeira(1)).resolves.not.toThrow();
  });

  it('deve lançar NotFoundException quando feira não existir em garantirExisteFeira', async () => {
    feiraRepository.exists.mockResolvedValue(false);

    await expect(service.garantirExisteFeira(99)).rejects.toThrow(
      new NotFoundException('Feira com ID 99 não encontrada.'),
    );
  });

  it('deve listar feiras ordenadas por nome', async () => {
    const feiras = [
      Object.assign(new Feira(), { id: 1, nome: 'Feira A' }),
      Object.assign(new Feira(), { id: 2, nome: 'Feira B' }),
    ];
    feiraRepository.find.mockResolvedValue(feiras);

    const result = await service.listarFeiras();

    expect(feiraRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
    expect(result).toBe(feiras);
  });
});
