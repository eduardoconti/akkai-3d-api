import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Feira, Venda } from '@venda/entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovimentacaoEstoque } from '@produto/entities';

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

  async listarVendas(): Promise<Venda[]> {
    return await this.vendaRepository.find({
      relations: { itens: { produto: true }, feira: true },
      order: { id: 'DESC' },
      take: 10,
    });
  }
}
