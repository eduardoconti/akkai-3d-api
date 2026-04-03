import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Carteira } from '@financeiro/entities';
import { Venda } from '@venda/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities';
import { PesquisarVendasDto } from '@venda/dto';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '../../common/utils/paginacao.util';

@Injectable()
export class VendaService {
  private readonly logger = new Logger(VendaService.name);

  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,
    @InjectRepository(Carteira)
    private readonly carteiraRepository: Repository<Carteira>,
    private readonly dataSource: DataSource,
  ) {}

  async existeCarteira(idCarteira: number): Promise<boolean> {
    return this.carteiraRepository.exists({
      where: { id: idCarteira, ativa: true },
    });
  }

  async inserirVenda(
    venda: Venda,
    movimentacaoEstoque: MovimentacaoEstoque[],
  ): Promise<Venda> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.save(venda);
      await queryRunner.manager.save(movimentacaoEstoque);
      await queryRunner.commitTransaction();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao inserir venda', errorMessage);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Erro ao inserir venda');
    } finally {
      await queryRunner.release();
    }
    return venda;
  }

  async listarVendas(
    pesquisa: PesquisarVendasDto,
  ): Promise<ResultadoPaginado<Venda>> {
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const termo = pesquisa.termo?.toLowerCase();

    const queryBuilder = this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.itens', 'item')
      .leftJoinAndSelect('item.produto', 'produto')
      .leftJoinAndSelect('venda.feira', 'feira')
      .leftJoinAndSelect('venda.carteira', 'carteira')
      .distinct(true)
      .orderBy('venda.id', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);

    if (pesquisa.tipo) {
      queryBuilder.andWhere('venda.tipo = :tipo', {
        tipo: pesquisa.tipo,
      });
    }

    if (termo) {
      queryBuilder.andWhere(
        `(
          CAST(venda.id AS TEXT) LIKE :termo
          OR LOWER(venda.meioPagamento) LIKE :termo
          OR LOWER(venda.tipo) LIKE :termo
          OR LOWER(COALESCE(feira.nome, '')) LIKE :termo
          OR LOWER(COALESCE(carteira.nome, '')) LIKE :termo
          OR LOWER(item.nomeProduto) LIKE :termo
        )`,
        { termo: `%${termo}%` },
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
}
