import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CicloAssinatura,
  ItemCicloAssinatura,
  StatusCiclo,
} from '@assinatura/entities';
import { PesquisarCiclosDto } from '@assinatura/dto';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';

const LOTE_SIZE = 100;

export interface InserirCiclosEmLoteResult {
  criados: number;
  ignorados: number;
}

@Injectable()
export class CicloService {
  private readonly logger = new Logger(CicloService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CicloAssinatura)
    private readonly cicloRepository: Repository<CicloAssinatura>,
  ) {}

  async salvarCiclo(ciclo: CicloAssinatura): Promise<CicloAssinatura> {
    return this.cicloRepository.save(ciclo).catch((error: unknown) => {
      this.logger.error('Erro ao salvar ciclo', error);
      lancarExcecaoConflito(
        error,
        'Já existe um ciclo para o assinante no mês/ano informado',
        'Erro ao salvar ciclo',
      );
    });
  }

  async inserirCiclosEmLote(
    idsAssinantes: number[],
    mesReferencia: number,
    anoReferencia: number,
    itensTemplate: Array<{
      idProduto: number;
      quantidade: number;
      observacao?: string;
    }>,
  ): Promise<InserirCiclosEmLoteResult> {
    let criados = 0;
    let ignorados = 0;

    for (let i = 0; i < idsAssinantes.length; i += LOTE_SIZE) {
      const lote = idsAssinantes.slice(i, i + LOTE_SIZE);

      const cicloValues = lote.map((idAssinante) => ({
        idAssinante,
        mesReferencia,
        anoReferencia,
        status: StatusCiclo.PENDENTE,
        dataInclusao: new Date(),
      }));

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(CicloAssinatura)
          .values(cicloValues)
          .orIgnore()
          .returning('id')
          .execute();

        const insertedIds: number[] = result.raw.map(
          (r: { id: number }) => r.id,
        );

        if (insertedIds.length > 0 && itensTemplate.length > 0) {
          const itemValues = insertedIds.flatMap((idCiclo) =>
            itensTemplate.map((item) => ({
              idCiclo,
              idProduto: item.idProduto,
              quantidade: item.quantidade,
              observacao: item.observacao,
            })),
          );

          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(ItemCicloAssinatura)
            .values(itemValues)
            .execute();
        }

        await queryRunner.commitTransaction();

        criados += insertedIds.length;
        ignorados += lote.length - insertedIds.length;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error('Erro ao inserir lote de ciclos', error);
        throw new InternalServerErrorException('Erro ao gerar ciclos mensais');
      } finally {
        await queryRunner.release();
      }
    }

    return { criados, ignorados };
  }

  async pesquisarCiclos(
    pesquisa: PesquisarCiclosDto,
  ): Promise<ResultadoPaginado<CicloAssinatura>> {
    const qb = this.cicloRepository
      .createQueryBuilder('ciclo')
      .leftJoinAndSelect('ciclo.assinante', 'assinante')
      .leftJoinAndSelect('ciclo.itens', 'itens')
      .leftJoinAndSelect('itens.produto', 'produto')
      .orderBy('ciclo.anoReferencia', 'DESC')
      .addOrderBy('ciclo.mesReferencia', 'DESC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (pesquisa.idAssinante) {
      qb.andWhere('ciclo.idAssinante = :idAssinante', {
        idAssinante: pesquisa.idAssinante,
      });
    }

    if (pesquisa.status) {
      qb.andWhere('ciclo.status = :status', { status: pesquisa.status });
    }

    if (pesquisa.mes) {
      qb.andWhere('ciclo.mesReferencia = :mes', { mes: pesquisa.mes });
    }

    if (pesquisa.ano) {
      qb.andWhere('ciclo.anoReferencia = :ano', { ano: pesquisa.ano });
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

  async obterCicloPorId(id: number): Promise<CicloAssinatura | null> {
    return this.cicloRepository.findOne({
      where: { id },
      relations: ['assinante', 'itens', 'itens.produto'],
    });
  }

  async garantirCicloPorId(id: number): Promise<CicloAssinatura> {
    const ciclo = await this.obterCicloPorId(id);
    if (!ciclo) {
      throw new NotFoundException(`Ciclo com ID ${id} não encontrado.`);
    }
    return ciclo;
  }

  async excluirCiclo(id: number): Promise<void> {
    await this.cicloRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir ciclo', error);
      throw new InternalServerErrorException('Erro ao excluir ciclo');
    });
  }
}
