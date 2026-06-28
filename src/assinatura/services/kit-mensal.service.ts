import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemKitMensal, KitMensal } from '@assinatura/entities';
import { PesquisarKitsDto } from '@assinatura/dto';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';

@Injectable()
export class KitMensalService {
  private readonly logger = new Logger(KitMensalService.name);

  constructor(
    @InjectRepository(KitMensal)
    private readonly kitRepository: Repository<KitMensal>,
    @InjectRepository(ItemKitMensal)
    private readonly itemKitRepository: Repository<ItemKitMensal>,
  ) {}

  async salvarKit(kit: KitMensal): Promise<KitMensal> {
    return this.kitRepository.save(kit).catch((error: unknown) => {
      this.logger.error('Erro ao salvar kit mensal', error);
      lancarExcecaoConflito(
        error,
        'Já existe um kit mensal para o plano no mês/ano informado',
        'Erro ao salvar kit mensal',
      );
    });
  }

  async atualizarItensKit(
    kit: KitMensal,
    novosItens: ItemKitMensal[],
  ): Promise<KitMensal> {
    await this.itemKitRepository.delete({ idKit: kit.id }).catch((error) => {
      this.logger.error('Erro ao excluir itens do kit mensal', error);
      throw new InternalServerErrorException(
        'Erro ao excluir itens do kit mensal',
      );
    });
    kit.itens = novosItens;
    return this.kitRepository.save(kit).catch((error: unknown) => {
      this.logger.error('Erro ao atualizar itens do kit mensal', error);
      throw new InternalServerErrorException(
        'Erro ao atualizar itens do kit mensal',
      );
    });
  }

  async pesquisarKits(
    pesquisa: PesquisarKitsDto,
  ): Promise<ResultadoPaginado<KitMensal>> {
    const qb = this.kitRepository
      .createQueryBuilder('kit')
      .leftJoinAndSelect('kit.plano', 'plano')
      .leftJoinAndSelect('kit.itens', 'itens')
      .leftJoinAndSelect('itens.produto', 'produto')
      .orderBy('kit.anoReferencia', 'DESC')
      .addOrderBy('kit.mesReferencia', 'DESC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (pesquisa.idPlano) {
      qb.andWhere('kit.idPlano = :idPlano', { idPlano: pesquisa.idPlano });
    }

    if (pesquisa.mes) {
      qb.andWhere('kit.mesReferencia = :mes', { mes: pesquisa.mes });
    }

    if (pesquisa.ano) {
      qb.andWhere('kit.anoReferencia = :ano', { ano: pesquisa.ano });
    }

    const [itens, totalItens] = await qb.getManyAndCount();

    return criarResultadoPaginado(
      itens,
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  async obterKitPorId(id: number): Promise<KitMensal | null> {
    return this.kitRepository.findOne({
      where: { id },
      relations: ['plano', 'itens', 'itens.produto'],
    });
  }

  async garantirKitPorId(id: number): Promise<KitMensal> {
    const kit = await this.obterKitPorId(id);
    if (!kit) {
      throw new NotFoundException(`Kit mensal com ID ${id} não encontrado.`);
    }
    return kit;
  }

  async obterKitPorPlanoMesAno(
    idPlano: number,
    mes: number,
    ano: number,
  ): Promise<KitMensal | null> {
    return this.kitRepository.findOne({
      where: { idPlano, mesReferencia: mes, anoReferencia: ano },
      relations: ['itens', 'itens.produto'],
    });
  }

  async obterKitVitrineAtivo(): Promise<KitMensal | null> {
    return this.kitRepository.findOne({ where: { ativo: true } });
  }

  async desativarTodosKits(): Promise<void> {
    await this.kitRepository
      .createQueryBuilder()
      .update(KitMensal)
      .set({ ativo: false })
      .where('"ativo" = TRUE')
      .execute()
      .catch((error) => {
        this.logger.error('Erro ao desativar kits', error);
        throw new InternalServerErrorException(
          'Erro ao desativar kits mensais',
        );
      });
  }

  async excluirKit(id: number): Promise<void> {
    await this.kitRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir kit mensal', error);
      throw new InternalServerErrorException('Erro ao excluir kit mensal');
    });
  }
}
