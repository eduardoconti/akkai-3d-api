import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assinante, StatusAssinante } from '@assinatura/entities';
import { PesquisarAssinantesDto } from '@assinatura/dto';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class AssinanteService {
  private readonly logger = new Logger(AssinanteService.name);

  constructor(
    @InjectRepository(Assinante)
    private readonly assinanteRepository: Repository<Assinante>,
  ) {}

  async salvarAssinante(assinante: Assinante): Promise<Assinante> {
    return this.assinanteRepository.save(assinante).catch((error: unknown) => {
      this.logger.error('Erro ao salvar assinante', error);
      lancarExcecaoConflito(
        error,
        'Conflito ao salvar assinante',
        'Erro ao salvar assinante',
      );
    });
  }

  async pesquisarAssinantes(
    pesquisa: PesquisarAssinantesDto,
  ): Promise<ResultadoPaginado<Assinante>> {
    const termo = pesquisa.termo?.toLowerCase();
    const qb = this.assinanteRepository
      .createQueryBuilder('assinante')
      .leftJoinAndSelect('assinante.plano', 'plano')
      .orderBy('assinante.nome', 'ASC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      qb.andWhere(
        "(LOWER(assinante.nome) LIKE :termo OR LOWER(COALESCE(assinante.email, '')) LIKE :termo)",
        { termo: `%${termo}%` },
      );
    }

    if (pesquisa.status) {
      qb.andWhere('assinante.status = :status', { status: pesquisa.status });
    }

    if (pesquisa.idPlano) {
      qb.andWhere('assinante.idPlano = :idPlano', {
        idPlano: pesquisa.idPlano,
      });
    }

    const [itens, totalItens] = await qb.getManyAndCount();

    return {
      itens,
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  async obterAssinantePorId(id: number): Promise<Assinante | null> {
    return this.assinanteRepository.findOne({
      where: { id },
      relations: ['plano'],
    });
  }

  async garantirAssinantePorId(id: number): Promise<Assinante> {
    const assinante = await this.obterAssinantePorId(id);
    if (!assinante) {
      throw new NotFoundException(`Assinante com ID ${id} não encontrado.`);
    }
    return assinante;
  }

  async listarAssinantesPorPlano(idPlano: number): Promise<Assinante[]> {
    return this.assinanteRepository.find({
      where: { idPlano, status: StatusAssinante.ATIVO },
      order: { nome: 'ASC' },
    });
  }

  async excluirAssinante(id: number): Promise<void> {
    await this.assinanteRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir assinante', error);
      throw new InternalServerErrorException('Erro ao excluir assinante');
    });
  }
}
