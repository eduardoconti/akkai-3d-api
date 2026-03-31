import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Feira, Venda } from '@venda/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities';
import { PesquisarVendasDto } from '@venda/dto';
import { ResultadoPaginado } from '../../common/interfaces/resultado-paginado.interface';

@Injectable()
export class VendaService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,
    @InjectRepository(Feira)
    private readonly feiraRepository: Repository<Feira>,
    private readonly dataSource: DataSource,
  ) {}

  async inserirFeira(feira: Feira): Promise<Feira> {
    return this.feiraRepository.save(feira).catch((error) => {
      console.error('Erro ao inserir feira:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.driverError?.code === '23505') {
        throw new ConflictException(`Feira ${feira.nome} já existe`);
      }

      throw new InternalServerErrorException('Erro ao inserir feira');
    });
  }

  async existeFeira(idFeira: number): Promise<boolean> {
    return this.feiraRepository.exists({
      where: { id: idFeira },
    });
  }

  async listarFeiras(): Promise<Feira[]> {
    return await this.feiraRepository.find({
      order: { nome: 'ASC' },
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
      console.error('Erro ao inserir venda:', errorMessage);
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
    const offset = (pesquisa.pagina - 1) * pesquisa.tamanhoPagina;
    const termo = pesquisa.termo?.toLowerCase();

    const queryBuilder = this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.itens', 'item')
      .leftJoinAndSelect('item.produto', 'produto')
      .leftJoinAndSelect('venda.feira', 'feira')
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
