import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaDespesa } from '@financeiro/entities';
import { Repository } from 'typeorm';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';

@Injectable()
export class CategoriaDespesaService {
  private readonly logger = new Logger(CategoriaDespesaService.name);

  constructor(
    @InjectRepository(CategoriaDespesa)
    private readonly categoriaDespesaRepository: Repository<CategoriaDespesa>,
  ) {}

  async salvarCategoriaDespesa(
    categoria: CategoriaDespesa,
  ): Promise<CategoriaDespesa> {
    return this.categoriaDespesaRepository
      .save(categoria)
      .catch((error: unknown) => {
        this.logger.error('Erro ao salvar categoria de despesa', error);
        lancarExcecaoConflito(
          error,
          `Categoria ${categoria.nome} já existe`,
          'Erro ao salvar categoria de despesa',
        );
      });
  }

  async listarCategoriasDespesa(): Promise<CategoriaDespesa[]> {
    return this.categoriaDespesaRepository.find({
      order: { nome: 'ASC' },
    });
  }

  async garantirCategoriaDespesaPorId(id: number): Promise<CategoriaDespesa> {
    const categoria = await this.categoriaDespesaRepository.findOne({
      where: { id },
    });
    if (!categoria) {
      throw new NotFoundException(
        `Categoria de despesa com ID ${id} não encontrada.`,
      );
    }
    return categoria;
  }

  async garantirExisteCategoriaDespesa(id: number): Promise<void> {
    const existe = await this.categoriaDespesaRepository.exists({
      where: { id },
    });
    if (!existe) {
      throw new NotFoundException(
        `Categoria de despesa com ID ${id} não encontrada.`,
      );
    }
  }
}
