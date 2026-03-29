import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Venda } from '@venda/entities/venda.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities/movimentacao-estoque.entity';

@Injectable()
export class VendaService {
  constructor(
    @InjectRepository(Venda)
    private readonly vendaRepository: Repository<Venda>,
    private readonly dataSource: DataSource,
  ) {}
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Erro ao inserir venda:', error.message);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Erro ao inserir venda');
    } finally {
      await queryRunner.release();
    }
    return venda;
  }

  async listarVendas(): Promise<Venda[]> {
    return await this.vendaRepository.find({
      relations: { itens: { produto: true } },
      order: { id: 'DESC' },
      take: 10,
    });
  }
}
