import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PesquisarDespesasDto } from '@financeiro/dto';
import { Carteira, CategoriaDespesa, Despesa } from '@financeiro/entities';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { DataSource, Repository } from 'typeorm';
import { lancarExcecaoConflito } from '../../common/database/lancar-excecao-conflito';
import { calcularOffset } from '../../common/utils/paginacao.util';

type ListarCarteiraRow = {
  id: number;
  nome: string;
  ativa: boolean;
  saldoAtual: string | number;
};

@Injectable()
export class FinanceiroService {
  private readonly logger = new Logger(FinanceiroService.name);

  constructor(
    @InjectRepository(Carteira)
    private readonly carteiraRepository: Repository<Carteira>,
    @InjectRepository(Despesa)
    private readonly despesaRepository: Repository<Despesa>,
    @InjectRepository(CategoriaDespesa)
    private readonly categoriaDespesaRepository: Repository<CategoriaDespesa>,
    private readonly dataSource: DataSource,
  ) {}

  async salvarCarteira(carteira: Carteira): Promise<Carteira> {
    return this.carteiraRepository.save(carteira).catch((error: unknown) => {
      this.logger.error('Erro ao salvar carteira', error);
      lancarExcecaoConflito(
        error,
        `Carteira ${carteira.nome} já existe`,
        'Erro ao salvar carteira',
      );
    });
  }

  async obterCarteiraPorId(id: number): Promise<Carteira | null> {
    return this.carteiraRepository.findOne({ where: { id } });
  }

  async garantirCarteiraPorId(id: number): Promise<Carteira> {
    const carteira = await this.obterCarteiraPorId(id);
    if (!carteira) {
      throw new NotFoundException('Carteira não encontrada');
    }
    return carteira;
  }

  async existeCarteira(idCarteira: number): Promise<boolean> {
    return this.carteiraRepository.exists({
      where: { id: idCarteira, ativa: true },
    });
  }

  async garantirExisteCarteira(id: number): Promise<void> {
    const existe = await this.existeCarteira(id);
    if (!existe) {
      throw new NotFoundException(`Carteira com ID ${id} não encontrada.`);
    }
  }

  async inserirDespesa(despesa: Despesa): Promise<Despesa> {
    return this.despesaRepository.save(despesa).catch((error) => {
      this.logger.error('Erro ao inserir despesa', error);
      throw new InternalServerErrorException('Erro ao inserir despesa');
    });
  }

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
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const termo = pesquisa.termo?.toLowerCase();

    const queryBuilder = this.despesaRepository
      .createQueryBuilder('despesa')
      .leftJoinAndSelect('despesa.carteira', 'carteira')
      .leftJoinAndSelect('despesa.categoria', 'categoria')
      .orderBy('despesa.dataLancamento', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.andWhere(
        `(
          LOWER(despesa.descricao) LIKE :termo
          OR LOWER(COALESCE(despesa.observacao, '')) LIKE :termo
          OR LOWER(carteira.nome) LIKE :termo
          OR LOWER(categoria.nome) LIKE :termo
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
