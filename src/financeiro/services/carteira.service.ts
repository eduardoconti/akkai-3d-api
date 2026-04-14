import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carteira } from '@financeiro/entities';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { DataSource, Repository } from 'typeorm';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';

type ListarCarteiraRow = {
  id: number;
  nome: string;
  ativa: boolean;
  saldoAtual: string | number;
  meiosPagamento: string;
};

@Injectable()
export class CarteiraService {
  private readonly logger = new Logger(CarteiraService.name);

  constructor(
    @InjectRepository(Carteira)
    private readonly carteiraRepository: Repository<Carteira>,
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

  async garantirCarteiraAceitaMeioPagamento(
    idCarteira: number,
    meioPagamento: MeioPagamento,
  ): Promise<void> {
    const carteira = await this.obterCarteiraPorId(idCarteira);
    if (!carteira || !carteira.ativa) {
      throw new NotFoundException(
        `Carteira com ID ${idCarteira} não encontrada.`,
      );
    }
    if (!carteira.aceitaMeioPagamento(meioPagamento)) {
      throw new BadRequestException(
        `A carteira não aceita o meio de pagamento ${meioPagamento}.`,
      );
    }
  }

  async listarCarteiras(): Promise<
    Array<{
      id: number;
      nome: string;
      ativa: boolean;
      saldoAtual: number;
      meiosPagamento: MeioPagamento[];
    }>
  > {
    const rows: ListarCarteiraRow[] = await this.dataSource.query(`
      SELECT
        c.id,
        c.nome,
        c.ativa,
        c.meios_pagamento AS "meiosPagamento",
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
      meiosPagamento: (JSON.parse(row.meiosPagamento) as MeioPagamento[]) ?? [],
    }));
  }

  async excluirCarteira(id: number): Promise<void> {
    await this.carteiraRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir carteira', error);
      throw new InternalServerErrorException('Erro ao excluir carteira');
    });
  }
}
