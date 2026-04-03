import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feira } from '@venda/entities';
import { lancarExcecaoConflito } from '../../common/database/lancar-excecao-conflito';

@Injectable()
export class FeiraService {
  private readonly logger = new Logger(FeiraService.name);

  constructor(
    @InjectRepository(Feira)
    private readonly feiraRepository: Repository<Feira>,
  ) {}

  async inserirFeira(feira: Feira): Promise<Feira> {
    return this.feiraRepository.save(feira).catch((error: unknown) => {
      this.logger.error('Erro ao inserir feira', error);
      lancarExcecaoConflito(
        error,
        `Feira ${feira.nome} já existe`,
        'Erro ao inserir feira',
      );
    });
  }

  async existeFeira(idFeira: number): Promise<boolean> {
    return this.feiraRepository.exists({
      where: { id: idFeira },
    });
  }

  async garantirExisteFeira(id: number): Promise<void> {
    const existe = await this.existeFeira(id);
    if (!existe) {
      throw new NotFoundException(`Feira com ID ${id} não encontrada.`);
    }
  }

  async listarFeiras(): Promise<Feira[]> {
    return this.feiraRepository.find({
      order: { nome: 'ASC' },
    });
  }
}
