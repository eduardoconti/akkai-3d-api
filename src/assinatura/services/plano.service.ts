import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanoAssinatura } from '@assinatura/entities';
import { PesquisarPlanosDto } from '@assinatura/dto';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';

@Injectable()
export class PlanoService {
  private readonly logger = new Logger(PlanoService.name);

  constructor(
    @InjectRepository(PlanoAssinatura)
    private readonly planoRepository: Repository<PlanoAssinatura>,
  ) {}

  async salvarPlano(plano: PlanoAssinatura): Promise<PlanoAssinatura> {
    return this.planoRepository.save(plano).catch((error: unknown) => {
      this.logger.error('Erro ao salvar plano', error);
      lancarExcecaoConflito(
        error,
        `Plano ${plano.nome} já existe`,
        'Erro ao salvar plano',
      );
    });
  }

  async listarPlanos(): Promise<PlanoAssinatura[]> {
    return this.planoRepository.find({ order: { nome: 'ASC' } });
  }

  async listarPlanosAtivos(): Promise<PlanoAssinatura[]> {
    return this.planoRepository.find({
      where: { ativo: true },
      order: { valor: 'ASC' },
    });
  }

  async pesquisarPlanos(
    pesquisa: PesquisarPlanosDto,
  ): Promise<ResultadoPaginado<PlanoAssinatura>> {
    const termo = pesquisa.termo?.toLowerCase();
    const qb = this.planoRepository
      .createQueryBuilder('plano')
      .orderBy('plano.nome', 'ASC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      qb.where(
        "(LOWER(plano.nome) LIKE :termo OR LOWER(COALESCE(plano.descricao, '')) LIKE :termo)",
        { termo: `%${termo}%` },
      );
    }

    const [itens, totalItens] = await qb.getManyAndCount();

    return criarResultadoPaginado(
      itens,
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  async obterPlanoPorId(id: number): Promise<PlanoAssinatura | null> {
    return this.planoRepository.findOne({ where: { id } });
  }

  async garantirPlanoPorId(id: number): Promise<PlanoAssinatura> {
    const plano = await this.obterPlanoPorId(id);
    if (!plano) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado.`);
    }
    return plano;
  }

  async excluirPlano(id: number): Promise<void> {
    await this.planoRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir plano', error);
      throw new InternalServerErrorException('Erro ao excluir plano');
    });
  }
}
