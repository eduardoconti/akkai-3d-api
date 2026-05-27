import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';
import {
  DetalheConsignacaoDto,
  ItemConsignacaoDto,
  ListarConsignacaoDto,
  PesquisarConsignacoesDto,
  RegistrarItemVendaConsignadaDto,
} from '@consignacao/dto';
import {
  Consignacao,
  ItemConsignacao,
  StatusConsignacao,
} from '@consignacao/entities';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/entities';

@Injectable()
export class ConsignacaoService {
  private readonly logger = new Logger(ConsignacaoService.name);

  constructor(
    @InjectRepository(Consignacao)
    private readonly consignacaoRepository: Repository<Consignacao>,
    @InjectRepository(ItemConsignacao)
    private readonly itemConsignacaoRepository: Repository<ItemConsignacao>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async salvarConsignacao(
    consignacao: Consignacao,
    itens: ItemConsignacao[],
    movimentacoes: MovimentacaoEstoque[],
  ): Promise<DetalheConsignacaoDto> {
    const idConsignacao = await this.dataSource
      .transaction(async (manager) => {
        const consignacaoSalva = await manager.save(Consignacao, consignacao);
        itens.forEach((item) => {
          item.idConsignacao = consignacaoSalva.id;
        });
        await manager.save(ItemConsignacao, itens);
        await manager.save(MovimentacaoEstoque, movimentacoes);
        return consignacaoSalva.id;
      })
      .catch((error) => {
        this.logger.error('Erro ao salvar consignação', error);
        throw new InternalServerErrorException('Erro ao salvar consignação');
      });

    return this.garantirDetalheConsignacao(idConsignacao);
  }

  async listarConsignacoes(
    pesquisa: PesquisarConsignacoesDto,
  ): Promise<ResultadoPaginado<ListarConsignacaoDto>> {
    const query = this.consignacaoRepository
      .createQueryBuilder('consignacao')
      .innerJoinAndSelect('consignacao.revendedor', 'revendedor')
      .leftJoinAndSelect('consignacao.itens', 'item');

    if (pesquisa.termo) {
      query.andWhere('LOWER(revendedor.nome) LIKE :termo', {
        termo: `%${pesquisa.termo.toLowerCase()}%`,
      });
    }

    if (pesquisa.idRevendedor) {
      query.andWhere('consignacao.idRevendedor = :idRevendedor', {
        idRevendedor: pesquisa.idRevendedor,
      });
    }

    if (pesquisa.status) {
      query.andWhere('consignacao.status = :status', {
        status: pesquisa.status,
      });
    }

    const orderBy =
      pesquisa.ordenarPor === 'revendedor'
        ? 'revendedor.nome'
        : 'consignacao.dataInclusao';
    const direcao = pesquisa.ordenarPor === 'revendedor' ? 'ASC' : 'DESC';

    const [consignacoes, totalItens] = await query
      .orderBy(orderBy, direcao)
      .addOrderBy('consignacao.id', 'DESC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina)
      .getManyAndCount();

    return {
      itens: consignacoes.map((consignacao) =>
        this.mapearListagem(consignacao),
      ),
      pagina: pesquisa.pagina,
      tamanhoPagina: pesquisa.tamanhoPagina,
      totalItens,
      totalPaginas: Math.max(1, Math.ceil(totalItens / pesquisa.tamanhoPagina)),
    };
  }

  async garantirDetalheConsignacao(id: number): Promise<DetalheConsignacaoDto> {
    const consignacao = await this.consignacaoRepository.findOne({
      where: { id },
      relations: {
        revendedor: true,
        itens: {
          produto: true,
        },
      },
      order: {
        itens: {
          id: 'ASC',
        },
      },
    });

    if (!consignacao) {
      throw new NotFoundException(`Consignação com ID ${id} não encontrada`);
    }

    return {
      ...this.mapearListagem(consignacao),
      itens: consignacao.itens.map((item) => this.mapearItem(item)),
    };
  }

  async registrarVendas(
    idConsignacao: number,
    itensVendidos: RegistrarItemVendaConsignadaDto[],
  ): Promise<DetalheConsignacaoDto> {
    this.validarProdutosVendidosUnicos(itensVendidos);
    const consignacao =
      await this.garantirConsignacaoAbertaComItens(idConsignacao);

    for (const itemVendido of itensVendidos) {
      const item = consignacao.itens.find(
        (itemConsignacao) =>
          itemConsignacao.idProduto === itemVendido.idProduto,
      );

      if (!item) {
        throw new NotFoundException(
          `Produto com ID ${itemVendido.idProduto} não encontrado na consignação.`,
        );
      }

      this.validarSaldoDisponivel(item, itemVendido.quantidade, 'venda');
      item.quantidadeVendida += itemVendido.quantidade;
    }

    await this.dataSource
      .transaction(async (manager) => {
        await manager.save(ItemConsignacao, consignacao.itens);
      })
      .catch((error) => {
        this.logger.error('Erro ao registrar vendas consignadas', error);
        throw new InternalServerErrorException(
          'Erro ao registrar vendas consignadas',
        );
      });

    return this.garantirDetalheConsignacao(idConsignacao);
  }

  async registrarDevolucao(
    idConsignacao: number,
    idItem: number,
    quantidade: number,
    idUsuarioInclusao: number,
  ): Promise<DetalheConsignacaoDto> {
    const item = await this.garantirItemAberto(idConsignacao, idItem);
    this.validarSaldoDisponivel(item, quantidade, 'devolução');
    item.quantidadeDevolvida += quantidade;
    const movimentacao = MovimentacaoEstoque.criar({
      idProduto: item.idProduto,
      quantidade,
      tipo: TipoMovimentacaoEstoque.ENTRADA,
      origem: OrigemMovimentacaoEstoque.CONSIGNACAO,
      idUsuarioInclusao,
    } satisfies CriarMovimentacaoEstoqueInput);

    await this.dataSource
      .transaction(async (manager) => {
        await manager.save(ItemConsignacao, item);
        await manager.save(MovimentacaoEstoque, movimentacao);
      })
      .catch((error) => {
        this.logger.error('Erro ao registrar devolução consignada', error);
        throw new InternalServerErrorException(
          'Erro ao registrar devolução consignada',
        );
      });

    return this.garantirDetalheConsignacao(idConsignacao);
  }

  private async garantirItemAberto(
    idConsignacao: number,
    idItem: number,
  ): Promise<ItemConsignacao> {
    const item = await this.itemConsignacaoRepository.findOne({
      where: { id: idItem, idConsignacao },
      relations: { consignacao: true },
    });

    if (!item) {
      throw new NotFoundException('Item de consignação não encontrado');
    }

    if (item.consignacao.status !== StatusConsignacao.ABERTA) {
      throw new BadRequestException(
        'A consignação precisa estar aberta para receber movimentos.',
      );
    }

    return item;
  }

  private async garantirConsignacaoAbertaComItens(
    idConsignacao: number,
  ): Promise<Consignacao> {
    const consignacao = await this.consignacaoRepository.findOne({
      where: { id: idConsignacao },
      relations: { itens: true },
    });

    if (!consignacao) {
      throw new NotFoundException(
        `Consignação com ID ${idConsignacao} não encontrada`,
      );
    }

    if (consignacao.status !== StatusConsignacao.ABERTA) {
      throw new BadRequestException(
        'A consignação precisa estar aberta para receber movimentos.',
      );
    }

    return consignacao;
  }

  private validarSaldoDisponivel(
    item: ItemConsignacao,
    quantidade: number,
    operacao: string,
  ): void {
    if (quantidade > item.quantidadeDisponivel) {
      throw new BadRequestException(
        `Quantidade de ${operacao} maior que o saldo disponível em consignação.`,
      );
    }
  }

  private validarProdutosVendidosUnicos(
    itensVendidos: RegistrarItemVendaConsignadaDto[],
  ): void {
    const idsProdutos = new Set<number>();

    for (const item of itensVendidos) {
      if (idsProdutos.has(item.idProduto)) {
        throw new BadRequestException(
          'A lista de vendas não pode repetir o mesmo produto em mais de um item.',
        );
      }

      idsProdutos.add(item.idProduto);
    }
  }

  private mapearListagem(consignacao: Consignacao): ListarConsignacaoDto {
    const totais = this.calcularTotais(consignacao.itens ?? []);

    return {
      id: consignacao.id,
      revendedor: {
        id: consignacao.revendedor.id,
        nome: consignacao.revendedor.nome,
        telefone: consignacao.revendedor.telefone,
        status: consignacao.revendedor.status,
      },
      status: consignacao.status,
      dataInclusao: consignacao.dataInclusao,
      ...totais,
    };
  }

  private mapearItem(item: ItemConsignacao): ItemConsignacaoDto {
    return {
      id: item.id,
      idProduto: item.idProduto,
      nomeProduto: item.produto.nome,
      codigoProduto: item.produto.codigo,
      quantidadeEnviada: item.quantidadeEnviada,
      quantidadeVendida: item.quantidadeVendida,
      quantidadeDevolvida: item.quantidadeDevolvida,
      quantidadeDisponivel: item.quantidadeDisponivel,
    };
  }

  private calcularTotais(itens: ItemConsignacao[]) {
    return itens.reduce(
      (totais, item) => ({
        quantidadeEnviada: totais.quantidadeEnviada + item.quantidadeEnviada,
        quantidadeVendida: totais.quantidadeVendida + item.quantidadeVendida,
        quantidadeDevolvida:
          totais.quantidadeDevolvida + item.quantidadeDevolvida,
        quantidadeDisponivel:
          totais.quantidadeDisponivel + item.quantidadeDisponivel,
      }),
      {
        quantidadeEnviada: 0,
        quantidadeVendida: 0,
        quantidadeDevolvida: 0,
        quantidadeDisponivel: 0,
      },
    );
  }
}
