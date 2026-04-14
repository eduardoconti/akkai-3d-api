import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaDespesa } from '@financeiro/entities';
import { CategoriaDespesaService } from './categoria-despesa.service';

describe('CategoriaDespesaService', () => {
  let service: CategoriaDespesaService;
  let categoriaDespesaRepository: {
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    exists: jest.Mock;
  };

  beforeEach(async () => {
    categoriaDespesaRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaDespesaService,
        {
          provide: getRepositoryToken(CategoriaDespesa),
          useValue: categoriaDespesaRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriaDespesaService>(CategoriaDespesaService);
  });

  it('deve salvar categoria de despesa com sucesso', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Matéria-prima',
    });
    categoriaDespesaRepository.save.mockResolvedValue(categoria);

    const result = await service.salvarCategoriaDespesa(categoria);

    expect(result).toBe(categoria);
  });

  it('deve lançar ConflictException ao salvar categoria com nome duplicado', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      nome: 'Embalagem',
    });
    categoriaDespesaRepository.save.mockRejectedValue({
      driverError: { code: '23505' },
    });

    await expect(service.salvarCategoriaDespesa(categoria)).rejects.toThrow(
      new ConflictException('Categoria Embalagem já existe'),
    );
  });

  it('deve lançar InternalServerErrorException ao falhar salvamento de categoria', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      nome: 'Embalagem',
    });
    categoriaDespesaRepository.save.mockRejectedValue(new Error('falha'));

    await expect(service.salvarCategoriaDespesa(categoria)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('deve listar categorias de despesa ordenadas por nome', async () => {
    const categorias = [
      Object.assign(new CategoriaDespesa(), { id: 1, nome: 'Embalagem' }),
      Object.assign(new CategoriaDespesa(), { id: 2, nome: 'Transporte' }),
    ];
    categoriaDespesaRepository.find.mockResolvedValue(categorias);

    const result = await service.listarCategoriasDespesa();

    expect(categoriaDespesaRepository.find).toHaveBeenCalledWith({
      order: { nome: 'ASC' },
    });
    expect(result).toBe(categorias);
  });

  it('deve garantir categoria de despesa por id retornando a categoria', async () => {
    const categoria = Object.assign(new CategoriaDespesa(), {
      id: 1,
      nome: 'Matéria-prima',
    });
    categoriaDespesaRepository.findOne.mockResolvedValue(categoria);

    const result = await service.garantirCategoriaDespesaPorId(1);

    expect(result).toBe(categoria);
  });

  it('deve lançar NotFoundException ao garantir categoria inexistente por id', async () => {
    categoriaDespesaRepository.findOne.mockResolvedValue(null);

    await expect(service.garantirCategoriaDespesaPorId(99)).rejects.toThrow(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );
  });

  it('deve garantir existência de categoria de despesa', async () => {
    categoriaDespesaRepository.exists.mockResolvedValue(true);

    await expect(
      service.garantirExisteCategoriaDespesa(1),
    ).resolves.not.toThrow();
  });

  it('deve lançar NotFoundException ao garantir existência de categoria inexistente', async () => {
    categoriaDespesaRepository.exists.mockResolvedValue(false);

    await expect(service.garantirExisteCategoriaDespesa(99)).rejects.toThrow(
      new NotFoundException('Categoria de despesa com ID 99 não encontrada.'),
    );
  });
});
