import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Produto } from '@produto/entities';
import { ProdutoService } from '@produto/services';
import { lancarExcecaoConflito } from '@common/database/lancar-excecao-conflito';
import {
  PesquisarPrecosProdutosFeiraDto,
  SalvarPrecoProdutoFeiraDto,
} from '@venda/dto';
import { PrecoProdutoFeira } from '@venda/entities';
import { Repository } from 'typeorm';
import { FeiraService } from './feira.service';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class PrecoProdutoFeiraService {
  private readonly logger = new Logger(PrecoProdutoFeiraService.name);

  constructor(
    @InjectRepository(PrecoProdutoFeira)
    private readonly precoProdutoFeiraRepository: Repository<PrecoProdutoFeira>,
    private readonly feiraService: FeiraService,
    private readonly produtoService: ProdutoService,
  ) {}

  async listarPorFeira(idFeira: number): Promise<PrecoProdutoFeira[]> {
    await this.feiraService.garantirExisteFeira(idFeira);

    return this.precoProdutoFeiraRepository
      .createQueryBuilder('preco')
      .innerJoinAndSelect('preco.produto', 'produto')
      .where('preco.idFeira = :idFeira', { idFeira })
      .orderBy('produto.nome', 'ASC')
      .getMany();
  }

  async pesquisarPrecos(
    pesquisa: PesquisarPrecosProdutosFeiraDto,
  ): Promise<ResultadoPaginado<PrecoProdutoFeira>> {
    const termo = pesquisa.termo?.toLowerCase();
    const orderByMap = {
      codigo: 'produto.codigo',
      nome: 'produto.nome',
      valor: 'preco.valor',
      feira: 'feira.nome',
    } as const;
    const orderBy = orderByMap[pesquisa.ordenarPor ?? 'codigo'];
    const orderDirection = pesquisa.direcao === 'desc' ? 'DESC' : 'ASC';
    const queryBuilder = this.precoProdutoFeiraRepository
      .createQueryBuilder('preco')
      .innerJoinAndSelect('preco.produto', 'produto')
      .innerJoinAndSelect('preco.feira', 'feira')
      .orderBy(orderBy, orderDirection)
      .addOrderBy('produto.nome', 'ASC')
      .addOrderBy('feira.nome', 'ASC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (pesquisa.idFeira !== undefined) {
      queryBuilder.andWhere('preco.idFeira = :idFeira', {
        idFeira: pesquisa.idFeira,
      });
    }

    if (termo) {
      queryBuilder.andWhere(
        '(LOWER(produto.nome) LIKE :termo OR CAST(produto.codigo AS text) LIKE :termo)',
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

  async salvarPreco(
    idFeira: number,
    input: SalvarPrecoProdutoFeiraDto,
  ): Promise<PrecoProdutoFeira> {
    await this.feiraService.garantirExisteFeira(idFeira);
    await this.produtoService.garantirExisteProduto(input.idProduto);

    const precoExistente = await this.precoProdutoFeiraRepository.findOne({
      where: {
        idFeira,
        idProduto: input.idProduto,
      },
    });

    const preco =
      precoExistente ??
      PrecoProdutoFeira.criar({
        idFeira,
        idProduto: input.idProduto,
        valor: input.valor,
      });

    preco.atualizarValor(input.valor);

    return this.precoProdutoFeiraRepository.save(preco).catch((error) => {
      this.logger.error('Erro ao salvar preço do produto na feira', error);
      lancarExcecaoConflito(
        error,
        'Preço do produto já cadastrado para esta feira',
        'Erro ao salvar preço do produto na feira',
      );
    });
  }

  async excluirPreco(idFeira: number, idProduto: number): Promise<void> {
    await this.precoProdutoFeiraRepository
      .delete({ idFeira, idProduto })
      .catch((error) => {
        this.logger.error('Erro ao excluir preço do produto na feira', error);
        throw new InternalServerErrorException(
          'Erro ao excluir preço do produto na feira',
        );
      });
  }

  async obterValorProdutoParaFeira(
    idFeira: number | undefined,
    produto: Produto,
  ): Promise<number> {
    if (idFeira === undefined) {
      return produto.valor;
    }

    const preco = await this.precoProdutoFeiraRepository.findOne({
      select: {
        valor: true,
      },
      where: {
        idFeira,
        idProduto: produto.id,
      },
    });

    return preco?.valor ?? produto.valor;
  }
}
