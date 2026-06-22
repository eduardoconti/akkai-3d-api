import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AjusteCarteira } from '@financeiro/entities';
import { MovimentacaoEstoque } from '@produto/entities';
import { TrocaDevolucao } from '@venda/entities';
import { DataSource } from 'typeorm';

@Injectable()
export class TrocaDevolucaoService {
  private readonly logger = new Logger(TrocaDevolucaoService.name);

  constructor(private readonly dataSource: DataSource) {}

  async inserirTrocaDevolucao(
    trocaDevolucao: TrocaDevolucao,
    movimentacoesEstoque: MovimentacaoEstoque[],
    ajusteCarteira?: AjusteCarteira,
  ): Promise<TrocaDevolucao> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const trocaDevolucaoSalva =
        await queryRunner.manager.save(trocaDevolucao);
      await queryRunner.manager.save(movimentacoesEstoque);

      if (ajusteCarteira) {
        await queryRunner.manager.save(ajusteCarteira);
      }

      await queryRunner.commitTransaction();
      return trocaDevolucaoSalva;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro ao inserir troca/devolução', errorMessage);
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao inserir troca/devolução');
    } finally {
      await queryRunner.release();
    }
  }
}
