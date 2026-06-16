import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orcamento } from '@orcamento/entities';
import { PesquisarOrcamentosDto } from '@orcamento/dto';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { Repository } from 'typeorm';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class OrcamentoService {
  private readonly logger = new Logger(OrcamentoService.name);

  constructor(
    @InjectRepository(Orcamento)
    private readonly orcamentoRepository: Repository<Orcamento>,
  ) {}

  async inserirOrcamento(orcamento: Orcamento): Promise<Orcamento> {
    return this.orcamentoRepository.save(orcamento).catch((error) => {
      this.logger.error('Erro ao inserir orçamento', error);
      throw new InternalServerErrorException('Erro ao inserir orçamento');
    });
  }

  async atualizarOrcamento(orcamento: Orcamento): Promise<Orcamento> {
    return this.orcamentoRepository.save(orcamento).catch((error) => {
      this.logger.error('Erro ao atualizar orçamento', error);
      throw new InternalServerErrorException('Erro ao atualizar orçamento');
    });
  }

  async buscarPorId(id: number): Promise<Orcamento | null> {
    return this.orcamentoRepository.findOne({
      where: { id },
      relations: ['feira'],
    });
  }

  async listarOrcamentos(
    pesquisa: PesquisarOrcamentosDto,
  ): Promise<ResultadoPaginado<Orcamento>> {
    const offset = calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina);
    const queryBuilder = this.orcamentoRepository
      .createQueryBuilder('orcamento')
      .leftJoinAndSelect('orcamento.feira', 'feira')
      .orderBy('orcamento.dataInclusao', 'DESC')
      .addOrderBy('orcamento.id', 'DESC')
      .skip(offset)
      .take(pesquisa.tamanhoPagina);
    const termo = pesquisa.termo?.toLowerCase();

    if (termo) {
      queryBuilder.andWhere(
        `(
          LOWER(COALESCE(orcamento.descricao, '')) LIKE :termo
          OR LOWER(orcamento.nomeCliente) LIKE :termo
          OR LOWER(COALESCE(orcamento.telefoneCliente, '')) LIKE :termo
        )`,
        { termo: `%${termo}%` },
      );
    }

    if (pesquisa.status?.length) {
      queryBuilder.andWhere('orcamento.status IN (:...status)', {
        status: pesquisa.status,
      });
    }

    if (pesquisa.tipo) {
      queryBuilder.andWhere('orcamento.tipo = :tipo', {
        tipo: pesquisa.tipo,
      });
    }

    if (pesquisa.canalAtendimento) {
      queryBuilder.andWhere('orcamento.canalAtendimento = :canalAtendimento', {
        canalAtendimento: pesquisa.canalAtendimento,
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

  async excluirOrcamento(id: number): Promise<void> {
    await this.orcamentoRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir orçamento', error);
      throw new InternalServerErrorException('Erro ao excluir orçamento');
    });
  }
}
