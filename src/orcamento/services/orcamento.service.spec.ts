import { InternalServerErrorException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Orcamento } from '@orcamento/entities';
import { OrcamentoService } from '@orcamento/services';
import { Test, TestingModule } from '@nestjs/testing';

describe('OrcamentoService', () => {
  let service: OrcamentoService;
  let repository: {
    save: jest.Mock;
    findAndCount: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrcamentoService,
        {
          provide: getRepositoryToken(Orcamento),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrcamentoService>(OrcamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve inserir orçamento', async () => {
    const orcamento = Object.assign(new Orcamento(), {
      id: 1,
      nomeCliente: 'Eduardo',
    });
    repository.save.mockResolvedValue(orcamento);

    const result = await service.inserirOrcamento(orcamento);

    expect(repository.save).toHaveBeenCalledWith(orcamento);
    expect(result).toBe(orcamento);
  });

  it('deve lançar erro ao falhar inserção de orçamento', async () => {
    repository.save.mockRejectedValue(new Error('falha'));

    await expect(service.inserirOrcamento(new Orcamento())).rejects.toThrow(
      new InternalServerErrorException('Erro ao inserir orçamento'),
    );
  });

  it('deve listar orçamentos paginados', async () => {
    repository.findAndCount.mockResolvedValue([
      [Object.assign(new Orcamento(), { id: 1 })],
      1,
    ]);

    const result = await service.listarOrcamentos({
      pagina: 1,
      tamanhoPagina: 10,
    });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      order: { dataInclusao: 'DESC', id: 'DESC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      itens: [expect.objectContaining({ id: 1 })],
      pagina: 1,
      tamanhoPagina: 10,
      totalItens: 1,
      totalPaginas: 1,
    });
  });
});
