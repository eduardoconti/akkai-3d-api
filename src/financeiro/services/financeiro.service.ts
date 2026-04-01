import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PesquisarDespesasDto } from '@financeiro/dto';
import { Carteira, Despesa } from '@financeiro/entities';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { DataSource, Repository } from 'typeorm';

type ListarCarteiraRow = {
  id: number;
  nome: string;
  ativa: boolean;
  saldoAtual: string | number;
};

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Carteira)
    private readonly carteiraRepository: Repository<Carteira>,
    @InjectRepository(Despesa)
    private readonly despesaRepository: Repository<Despesa>,
    private readonly dataSource: DataSource,
  ) {}

  async salvarCarteira(carteira: Carteira): Promise<Carteira> {
    return this.carteiraRepository.save(carteira).catch((error) => {
      console.error('Erro ao salvar carteira:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.driverError?.code === '23505') {
        throw new ConflictException(`Carteira ${carteira.nome} já existe`);
      }

      throw new InternalServerErrorException('Erro ao salvar carteira');
    });
  }

  async obterCarteiraPorId(id: number): Promise<Carteira | null> {
    return this.carteiraRepository.findOne({ where: { id } });
  }

  async existeCarteira(idCarteira: number): Promise<boolean> {
    return this.carteiraRepository.exists({
      where: { id: idCarteira, ativa: true },
    });
  }

  async inserirDespesa(despesa: Despesa): Promise<Despesa> {
    return this.despesaRepository.save(despesa).catch((error) => {
      console.error('Erro ao inserir despesa:', error);
      throw new InternalServerErrorException('Erro ao inserir despesa');
    });
  }

  async listarCarteiras(): Promise<
    Array<{
      id: number;
      nome: string;
      ativa: boolean;
      saldoAtual: number;
    }>
  > {
    const rows: ListarCarteiraRow[] = await this.dataSource.query(`
      SELECT
        c.id,
        c.nome,
        c.ativa,
        (
          COALESCE(
            (
              SELECT SUM(v.valor_total)
              FROM venda v
              WHERE v.id_carteira = c.id
            ),
            0
          ) -
          COALESCE(
            (
              SELECT SUM(d.valor)
              FROM despesa d
              WHERE d.id_carteira = c.id
            ),
            0
          )
        ) AS "saldoAtual"
      FROM carteira c
      ORDER BY c.nome ASC
    `);

    return rows.map((row) => ({
      id: row.id,
      nome: row.nome,
      ativa: row.ativa,
      saldoAtual: Number(row.saldoAtual),
    }));
  }

  async listarDespesas(
    pesquisa: PesquisarDespesasDto,
  ): Promise<ResultadoPaginado<Despesa>> {
    const offset = (pesquisa.pagina - 1) * pesquisa.tamanhoPagina;
    const termo = pesquisa.termo?.toLowerCase();

    const queryBuilder = this.despesaRepository
      .createQueryBuilder('despesa')
      .leftJoinAndSelect('despesa.carteira', 'carteira')
      .orderBy('despesa.dataLancamento', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.andWhere(
        `(
          LOWER(despesa.descricao) LIKE :termo
          OR LOWER(COALESCE(despesa.observacao, '')) LIKE :termo
          OR LOWER(carteira.nome) LIKE :termo
          OR LOWER(despesa.categoria) LIKE :termo
        )`,
        { termo: `%${termo}%` },
      );
    }

    if (pesquisa.dataInicio) {
      queryBuilder.andWhere('despesa.dataLancamento >= :dataInicio', {
        dataInicio: `${pesquisa.dataInicio} 00:00:00.000`,
      });
    }

    if (pesquisa.dataFim) {
      queryBuilder.andWhere('despesa.dataLancamento <= :dataFim', {
        dataFim: `${pesquisa.dataFim} 23:59:59.999`,
      });
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
}
