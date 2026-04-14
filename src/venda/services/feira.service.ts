import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PesquisarFeirasDto } from '@venda/dto';
import { Feira } from '@venda/entities';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class FeiraService {
  private readonly logger = new Logger(FeiraService.name);

  constructor(
    @InjectRepository(Feira)
    private readonly feiraRepository: Repository<Feira>,
  ) {}

  async salvarFeira(feira: Feira): Promise<Feira> {
    return this.feiraRepository.save(feira).catch((error: unknown) => {
      this.logger.error('Erro ao salvar feira', error);
      lancarExcecaoConflito(
        error,
        `Feira ${feira.nome} já existe`,
        'Erro ao salvar feira',
      );
    });
  }

  async inserirFeira(feira: Feira): Promise<Feira> {
    return this.salvarFeira(feira);
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

  async pesquisarFeiras(
    pesquisa: PesquisarFeirasDto,
  ): Promise<ResultadoPaginado<Feira>> {
    const termo = pesquisa.termo?.toLowerCase();
    const queryBuilder = this.feiraRepository
      .createQueryBuilder('feira')
      .orderBy('feira.nome', 'ASC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.where(
        "(LOWER(feira.nome) LIKE :termo OR LOWER(COALESCE(feira.local, '')) LIKE :termo OR LOWER(COALESCE(feira.descricao, '')) LIKE :termo)",
        {
          termo: `%${termo}%`,
        },
      );
    }

    const [itens, totalItens] = await queryBuilder.getManyAndCount();

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  async obterFeiraPorId(id: number): Promise<Feira | null> {
    return this.feiraRepository.findOne({ where: { id } });
  }

  async garantirFeiraPorId(id: number): Promise<Feira> {
    const feira = await this.obterFeiraPorId(id);
    if (!feira) {
      throw new NotFoundException(`Feira com ID ${id} não encontrada.`);
    }

    return feira;
  }
}
