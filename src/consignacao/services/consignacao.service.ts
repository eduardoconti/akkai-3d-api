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
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';
import {
  DetalheConsignacaoDto,
  ItemConsignacaoDto,
  ListarConsignacaoDto,
  PesquisarConsignacoesDto,
  RegistrarItemVendaConsignadaDto,
} from '@consignacao/dto';
import { Consignacao, ItemConsignacao } from '@consignacao/entities';
import { StatusConsignacao } from '@consignacao/enums';
import {
  CriarMovimentacaoEstoqueInput,
  MovimentacaoEstoque,
} from '@produto/entities';
import {
  OrigemMovimentacaoEstoque,
  TipoMovimentacaoEstoque,
} from '@produto/enums';
import { ItemVendaInput, PagamentoVendaInput, Venda } from '@venda/entities';
import { MeioPagamento } from '@common/enums/meio-pagamento.enum';
import { TipoVenda } from '@venda/enums';

export interface RegistrarPagamentoVendaConsignadaInput {
  idCarteira: number;
  meioPagamento: MeioPagamento;
  percentualTaxa?: number | null;
  percentualImposto?: number | null;
}

interface RegistroVendaConsignadaAgrupado {
  consignacao: Consignacao;
  itensVenda: ItemVendaInput[];
}

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

    return criarResultadoPaginado(
      consignacoes.map((consignacao) => this.mapearListagem(consignacao)),
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
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

  async registrarVendasPorRevendedor(
    idRevendedor: number,
    itensVendidos: RegistrarItemVendaConsignadaDto[],
    pagamento: RegistrarPagamentoVendaConsignadaInput,
    idUsuarioInclusao: number,
  ): Promise<DetalheConsignacaoDto[]> {
    this.validarProdutosVendidosUnicos(itensVendidos);
    const consignacoes =
      await this.listarConsignacoesAbertasPorRevendedor(idRevendedor);
    const registrosPorConsignacao = new Map<
      number,
      RegistroVendaConsignadaAgrupado
    >();
    const itensAlterados = new Set<ItemConsignacao>();

    for (const itemVendido of itensVendidos) {
      const itensProduto = consignacoes.flatMap((consignacao) =>
        consignacao.itens.filter(
          (itemConsignacao) =>
            itemConsignacao.idProduto === itemVendido.idProduto,
        ),
      );

      if (itensProduto.length === 0) {
        throw new NotFoundException(
          `Produto com ID ${itemVendido.idProduto} não encontrado nas consignações abertas do revendedor.`,
        );
      }

      const quantidadeDisponivelProduto = itensProduto.reduce(
        (total, item) => total + item.quantidadeDisponivel,
        0,
      );

      if (quantidadeDisponivelProduto < itemVendido.quantidade) {
        throw new BadRequestException(
          `Saldo disponível insuficiente para o produto com ID ${itemVendido.idProduto} nas consignações abertas do revendedor. Disponível: ${quantidadeDisponivelProduto}. Solicitado: ${itemVendido.quantidade}.`,
        );
      }

      let quantidadeRestante = itemVendido.quantidade;

      for (const consignacao of consignacoes) {
        if (quantidadeRestante === 0) {
          break;
        }

        const item = consignacao.itens.find(
          (itemConsignacao) =>
            itemConsignacao.idProduto === itemVendido.idProduto &&
            itemConsignacao.quantidadeDisponivel > 0,
        );

        if (!item) {
          continue;
        }

        const quantidadeBaixada = Math.min(
          quantidadeRestante,
          item.quantidadeDisponivel,
        );
        item.quantidadeVendida += quantidadeBaixada;
        itensAlterados.add(item);
        quantidadeRestante -= quantidadeBaixada;

        const registro = this.obterRegistroVendaConsignada(
          registrosPorConsignacao,
          consignacao,
        );
        registro.itensVenda.push(
          this.criarItemVendaInput(
            item,
            quantidadeBaixada,
            consignacao.percentualDesconto,
          ),
        );
      }
    }

    const vendas = Array.from(registrosPorConsignacao.values()).map(
      (registro) =>
        this.criarVendaConsignada(
          registro.consignacao.id,
          registro.itensVenda,
          pagamento,
          idUsuarioInclusao,
        ),
    );
    const idsConsignacoesAlteradas = Array.from(registrosPorConsignacao.keys());
    const consignacoesAlteradas = Array.from(
      registrosPorConsignacao.values(),
    ).map((registro) => registro.consignacao);
    const consignacoesFechadas = consignacoesAlteradas.filter((consignacao) =>
      this.fecharConsignacaoSeSemSaldo(consignacao),
    );

    await this.dataSource
      .transaction(async (manager) => {
        await manager.save(ItemConsignacao, Array.from(itensAlterados));
        if (consignacoesFechadas.length > 0) {
          await manager.save(Consignacao, consignacoesFechadas);
        }
        await manager.save(Venda, vendas);
      })
      .catch((error) => {
        this.logger.error(
          'Erro ao registrar vendas consignadas por revendedor',
          error,
        );
        throw new InternalServerErrorException(
          'Erro ao registrar vendas consignadas',
        );
      });

    return Promise.all(
      idsConsignacoesAlteradas.map((id) => this.garantirDetalheConsignacao(id)),
    );
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
    this.sincronizarItemNaConsignacao(item);
    const consignacaoFechada = this.fecharConsignacaoSeSemSaldo(
      item.consignacao,
    );
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
        if (consignacaoFechada) {
          await manager.save(Consignacao, item.consignacao);
        }
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

  async adicionarItem(
    idConsignacao: number,
    item: ItemConsignacao,
    movimentacao: MovimentacaoEstoque,
  ): Promise<DetalheConsignacaoDto> {
    const consignacao = await this.garantirConsignacaoAberta(idConsignacao);

    if (
      consignacao.itens.some(
        (itemConsignacao) => itemConsignacao.idProduto === item.idProduto,
      )
    ) {
      throw new BadRequestException(
        'A consignação não pode repetir o mesmo produto em mais de um item.',
      );
    }

    item.idConsignacao = idConsignacao;

    await this.dataSource
      .transaction(async (manager) => {
        await manager.save(ItemConsignacao, item);
        await manager.save(MovimentacaoEstoque, movimentacao);
      })
      .catch((error) => {
        this.logger.error('Erro ao adicionar item à consignação', error);
        throw new InternalServerErrorException(
          'Erro ao adicionar item à consignação',
        );
      });

    return this.garantirDetalheConsignacao(idConsignacao);
  }

  async alterarItem(
    item: ItemConsignacao,
    quantidadeEnviada: number,
    valorUnitario: number,
    movimentacao?: MovimentacaoEstoque,
  ): Promise<DetalheConsignacaoDto> {
    const quantidadeMovimentada =
      item.quantidadeVendida + item.quantidadeDevolvida;

    if (quantidadeEnviada < quantidadeMovimentada) {
      throw new BadRequestException(
        'A quantidade enviada não pode ser menor que a quantidade já vendida ou devolvida.',
      );
    }

    item.quantidadeEnviada = quantidadeEnviada;
    item.valorUnitario = valorUnitario;
    this.sincronizarItemNaConsignacao(item);
    const consignacaoFechada = this.fecharConsignacaoSeSemSaldo(
      item.consignacao,
    );

    await this.dataSource
      .transaction(async (manager) => {
        await manager.save(ItemConsignacao, item);

        if (consignacaoFechada) {
          await manager.save(Consignacao, item.consignacao);
        }

        if (movimentacao) {
          await manager.save(MovimentacaoEstoque, movimentacao);
        }
      })
      .catch((error) => {
        this.logger.error('Erro ao alterar item da consignação', error);
        throw new InternalServerErrorException(
          'Erro ao alterar item da consignação',
        );
      });

    return this.garantirDetalheConsignacao(item.idConsignacao);
  }

  async excluirItem(
    item: ItemConsignacao,
    movimentacao: MovimentacaoEstoque,
  ): Promise<DetalheConsignacaoDto> {
    if (item.quantidadeVendida > 0 || item.quantidadeDevolvida > 0) {
      throw new BadRequestException(
        'Não é possível excluir item com venda ou devolução registrada.',
      );
    }

    await this.dataSource
      .transaction(async (manager) => {
        await manager.delete(ItemConsignacao, { id: item.id });
        await manager.save(MovimentacaoEstoque, movimentacao);
      })
      .catch((error) => {
        this.logger.error('Erro ao excluir item da consignação', error);
        throw new InternalServerErrorException(
          'Erro ao excluir item da consignação',
        );
      });

    return this.garantirDetalheConsignacao(item.idConsignacao);
  }

  async garantirItemAberto(
    idConsignacao: number,
    idItem: number,
  ): Promise<ItemConsignacao> {
    return this.garantirItemConsignacaoAberto(idConsignacao, idItem);
  }

  private async garantirItemConsignacaoAberto(
    idConsignacao: number,
    idItem: number,
  ): Promise<ItemConsignacao> {
    const item = await this.itemConsignacaoRepository.findOne({
      where: { id: idItem, idConsignacao },
      relations: {
        consignacao: {
          itens: true,
        },
      },
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

  private async garantirConsignacaoAberta(
    idConsignacao: number,
  ): Promise<Consignacao> {
    const consignacao = await this.consignacaoRepository.findOne({
      where: { id: idConsignacao },
      relations: {
        itens: true,
      },
    });

    if (!consignacao) {
      throw new NotFoundException(
        `Consignação com ID ${idConsignacao} não encontrada`,
      );
    }

    if (consignacao.status !== StatusConsignacao.ABERTA) {
      throw new BadRequestException(
        'A consignação precisa estar aberta para alterar itens.',
      );
    }

    return consignacao;
  }

  private async listarConsignacoesAbertasPorRevendedor(
    idRevendedor: number,
  ): Promise<Consignacao[]> {
    const consignacoes = await this.consignacaoRepository.find({
      where: {
        idRevendedor,
        status: StatusConsignacao.ABERTA,
      },
      relations: {
        revendedor: true,
        itens: {
          produto: true,
        },
      },
      order: {
        dataInclusao: 'ASC',
        id: 'ASC',
        itens: {
          id: 'ASC',
        },
      },
    });

    if (consignacoes.length === 0) {
      throw new BadRequestException(
        'O revendedor não possui consignações abertas para registrar vendas.',
      );
    }

    return consignacoes;
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

  private sincronizarItemNaConsignacao(item: ItemConsignacao): void {
    const itemConsignacao = (item.consignacao.itens ?? []).find(
      (itemAtual) => itemAtual.id === item.id,
    );

    if (!itemConsignacao) {
      return;
    }

    itemConsignacao.quantidadeVendida = item.quantidadeVendida;
    itemConsignacao.quantidadeDevolvida = item.quantidadeDevolvida;
  }

  private fecharConsignacaoSeSemSaldo(consignacao: Consignacao): boolean {
    const itens = consignacao.itens ?? [];
    const temItens = itens.length > 0;
    const semSaldo = itens.every((item) => item.quantidadeDisponivel === 0);

    if (
      temItens &&
      semSaldo &&
      consignacao.status === StatusConsignacao.ABERTA
    ) {
      consignacao.status = StatusConsignacao.FECHADA;
      return true;
    }

    return false;
  }

  private obterRegistroVendaConsignada(
    registros: Map<number, RegistroVendaConsignadaAgrupado>,
    consignacao: Consignacao,
  ): RegistroVendaConsignadaAgrupado {
    const registroExistente = registros.get(consignacao.id);

    if (registroExistente) {
      return registroExistente;
    }

    const registro: RegistroVendaConsignadaAgrupado = {
      consignacao,
      itensVenda: [],
    };
    registros.set(consignacao.id, registro);
    return registro;
  }

  private criarItemVendaInput(
    item: ItemConsignacao,
    quantidade: number,
    percentualDesconto: number,
  ): ItemVendaInput {
    return {
      idProduto: item.idProduto,
      nomeProduto: item.produto.nome,
      quantidade,
      valorUnitario: this.calcularValorComDesconto(
        item.valorUnitario,
        percentualDesconto,
      ),
      brinde: false,
    };
  }

  private calcularValorComDesconto(
    valor: number,
    percentualDesconto: number,
  ): number {
    const fatorDesconto = 1 - percentualDesconto / 100;
    return Math.max(0, Math.round(valor * fatorDesconto));
  }

  private criarVendaConsignada(
    idConsignacao: number,
    itensVenda: ItemVendaInput[],
    pagamento: RegistrarPagamentoVendaConsignadaInput,
    idUsuarioInclusao: number,
  ): Venda {
    const valorTotal = itensVenda.reduce(
      (total, item) => total + item.quantidade * item.valorUnitario,
      0,
    );
    const pagamentos: PagamentoVendaInput[] = [
      {
        idCarteira: pagamento.idCarteira,
        meioPagamento: pagamento.meioPagamento,
        valor: valorTotal,
        percentualTaxa: pagamento.percentualTaxa ?? null,
        percentualImposto: pagamento.percentualImposto ?? null,
      },
    ];
    const venda = Venda.criar({
      dataVenda: new Date(),
      tipo: TipoVenda.CONSIGNACAO,
      idConsignacao,
      itens: itensVenda,
      pagamentos,
    });
    venda.idUsuarioInclusao = idUsuarioInclusao;

    return venda;
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
        percentualDesconto: consignacao.revendedor.percentualDesconto,
      },
      status: consignacao.status,
      dataInclusao: consignacao.dataInclusao,
      percentualDesconto: consignacao.percentualDesconto,
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
      valorUnitario: item.valorUnitario,
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
