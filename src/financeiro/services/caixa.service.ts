import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultaCaixa } from '@financeiro/contracts';
import { Caixa, ConferenciaCarteiraCaixa } from '@financeiro/entities';
import { StatusCaixa } from '@financeiro/enums';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { DateService } from '@common/services/date.service';
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';
import { DataSource, Not, Repository } from 'typeorm';
import { CarteiraService } from './carteira.service';

interface DadosCaixaInput {
  idFeira: number;
  carteiras: Array<{ idCarteira: number; valorAbertura: number }>;
  observacao?: string;
}
interface AbrirCaixaInput extends DadosCaixaInput {
  idUsuario: number;
}
interface FecharCaixaInput {
  carteiras: Array<{ idCarteira: number; valorInformadoFechamento: number }>;
}
interface PesquisarCaixasInput {
  pagina: number;
  tamanhoPagina: number;
  dataInicio?: string;
  dataFim?: string;
  idFeira?: number;
}

@Injectable()
export class CaixaService implements ConsultaCaixa {
  constructor(
    @InjectRepository(Caixa)
    private readonly caixaRepository: Repository<Caixa>,
    @InjectRepository(ConferenciaCarteiraCaixa)
    private readonly conferenciaRepository: Repository<ConferenciaCarteiraCaixa>,
    private readonly carteiraService: CarteiraService,
    private readonly dataSource: DataSource,
    private readonly dateService: DateService,
  ) {}

  async abrir(input: AbrirCaixaInput): Promise<Caixa> {
    await this.validarDadosCaixa(input);
    if (
      await this.caixaRepository.exists({
        where: { idFeira: input.idFeira, status: StatusCaixa.ABERTO },
      })
    ) {
      throw new ConflictException('Já existe um caixa aberto para esta feira.');
    }
    const caixa = this.caixaRepository.create({
      idFeira: input.idFeira,
      status: StatusCaixa.ABERTO,
      dataAbertura: this.dateService.obterDataHoraAtual(),
      idUsuarioAbertura: input.idUsuario,
      observacao: this.normalizarObservacao(input.observacao),
      conferencias: input.carteiras.map((item) =>
        this.conferenciaRepository.create(item),
      ),
    });
    const caixaSalvo = await this.caixaRepository.save(caixa);
    return this.obterPorId(caixaSalvo.id);
  }

  async alterar(id: number, input: DadosCaixaInput): Promise<Caixa> {
    const caixa = await this.obterPorId(id);
    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new ConflictException('Um caixa fechado não pode ser alterado.');
    }

    await this.validarDadosCaixa(input, caixa.idFeira);
    const idsCarteirasAtuais = new Set(
      caixa.conferencias.map((item) => item.idCarteira),
    );
    if (
      input.carteiras.length !== idsCarteirasAtuais.size ||
      input.carteiras.some((item) => !idsCarteirasAtuais.has(item.idCarteira))
    ) {
      throw new BadRequestException(
        'A edição deve manter todas as carteiras da abertura do caixa.',
      );
    }

    if (input.idFeira !== caixa.idFeira) {
      const vendas: Array<{ total: string | number }> =
        await this.dataSource.query(
          'SELECT COUNT(*) AS total FROM venda WHERE id_caixa = $1',
          [id],
        );
      if (Number(vendas[0]?.total ?? 0) > 0) {
        throw new BadRequestException(
          'A feira não pode ser alterada após o registro de vendas no caixa.',
        );
      }
      if (
        await this.caixaRepository.exists({
          where: {
            id: Not(id),
            idFeira: input.idFeira,
            status: StatusCaixa.ABERTO,
          },
        })
      ) {
        throw new ConflictException(
          'Já existe um caixa aberto para esta feira.',
        );
      }
    }

    const valoresAbertura = new Map(
      input.carteiras.map((item) => [item.idCarteira, item.valorAbertura]),
    );
    caixa.idFeira = input.idFeira;
    caixa.observacao = this.normalizarObservacao(input.observacao);
    caixa.conferencias.forEach((item) => {
      item.valorAbertura = valoresAbertura.get(item.idCarteira)!;
    });

    await this.caixaRepository.save(caixa);
    return this.obterPorId(id);
  }

  async obterAbertoPorFeira(idFeira: number): Promise<Caixa | null> {
    return this.caixaRepository.findOne({
      where: { idFeira, status: StatusCaixa.ABERTO },
      relations: { conferencias: { carteira: true } },
    });
  }

  async pesquisar(
    pesquisa: PesquisarCaixasInput,
  ): Promise<ResultadoPaginado<Caixa>> {
    const queryBuilder = this.caixaRepository
      .createQueryBuilder('caixa')
      .leftJoinAndMapOne(
        'caixa.feira',
        'feira',
        'feira',
        'feira.id = caixa.idFeira',
      );

    if (pesquisa.dataInicio) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataInicio);
      queryBuilder.andWhere('caixa.dataAbertura >= :dataInicio', {
        dataInicio: range.start,
      });
    }

    if (pesquisa.dataFim) {
      const range = this.dateService.toUtcDateRange(pesquisa.dataFim);
      queryBuilder.andWhere('caixa.dataAbertura <= :dataFim', {
        dataFim: range.end,
      });
    }

    if (pesquisa.idFeira) {
      queryBuilder.andWhere('caixa.idFeira = :idFeira', {
        idFeira: pesquisa.idFeira,
      });
    }

    const [itens, totalItens] = await queryBuilder
      .orderBy('caixa.dataAbertura', 'DESC')
      .addOrderBy('caixa.id', 'DESC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina)
      .getManyAndCount();

    return criarResultadoPaginado(
      itens,
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  private async validarDadosCaixa(
    input: DadosCaixaInput,
    idFeiraAtual?: number,
  ): Promise<void> {
    const feiras: Array<{ existe: boolean }> = await this.dataSource.query(
      'SELECT EXISTS(SELECT 1 FROM feira WHERE id = $1 AND (ativa = true OR id = $2)) AS existe',
      [input.idFeira, idFeiraAtual ?? null],
    );
    if (!feiras[0]?.existe) {
      throw new NotFoundException('Feira não encontrada.');
    }
    if (
      new Set(input.carteiras.map((item) => item.idCarteira)).size !==
      input.carteiras.length
    ) {
      throw new BadRequestException(
        'Cada carteira deve ser informada uma única vez.',
      );
    }
    await Promise.all(
      input.carteiras.map((item) =>
        this.carteiraService.garantirExisteCarteira(item.idCarteira),
      ),
    );
  }

  private normalizarObservacao(observacao?: string): string | null {
    return observacao?.trim() || null;
  }

  async obterPorId(id: number): Promise<Caixa> {
    const caixa = await this.caixaRepository.findOne({
      where: { id },
      relations: { conferencias: { carteira: true } },
    });
    if (!caixa) throw new NotFoundException('Caixa não encontrado.');
    return caixa;
  }

  async garantirCaixaAbertoParaVenda(input: {
    idCaixa?: number;
    idFeira?: number;
    idsCarteiras: number[];
  }): Promise<void> {
    if (!input.idFeira) return;
    if (!input.idCaixa)
      throw new BadRequestException(
        'É necessário abrir o caixa antes de registrar uma venda de feira.',
      );
    const caixa = await this.obterPorId(input.idCaixa);
    if (
      caixa.status !== StatusCaixa.ABERTO ||
      caixa.idFeira !== input.idFeira
    ) {
      throw new BadRequestException(
        'O caixa informado não está aberto para esta feira.',
      );
    }
    const permitidas = new Set(
      caixa.conferencias.map((item) => item.idCarteira),
    );
    if (input.idsCarteiras.some((id) => !permitidas.has(id))) {
      throw new BadRequestException(
        'Uma das carteiras do pagamento não participa deste caixa.',
      );
    }
  }

  async fechar(
    id: number,
    input: FecharCaixaInput,
    idUsuario: number,
  ): Promise<Caixa> {
    const caixa = await this.obterPorId(id);
    if (caixa.status !== StatusCaixa.ABERTO)
      throw new ConflictException('O caixa já está fechado.');
    const informados = new Map(
      input.carteiras.map((item) => [
        item.idCarteira,
        item.valorInformadoFechamento,
      ]),
    );
    if (
      caixa.conferencias.some((item) => !informados.has(item.idCarteira)) ||
      informados.size !== caixa.conferencias.length
    ) {
      throw new BadRequestException(
        'Informe o fechamento de todas as carteiras do caixa.',
      );
    }
    const rows: Array<{ idCarteira: number; total: string }> =
      await this.dataSource.query(
        `SELECT p.id_carteira AS "idCarteira", COALESCE(SUM(p.valor - COALESCE(p.valor_taxa, 0)), 0) AS total
       FROM pagamento_venda p INNER JOIN venda v ON v.id = p.id_venda
       WHERE v.id_caixa = $1 GROUP BY p.id_carteira`,
        [id],
      );
    const entradas = new Map(
      rows.map((row) => [Number(row.idCarteira), Number(row.total)]),
    );
    for (const item of caixa.conferencias) {
      item.totalEntradas = entradas.get(item.idCarteira) ?? 0;
      item.valorEsperadoFechamento = item.valorAbertura + item.totalEntradas;
      item.valorInformadoFechamento = informados.get(item.idCarteira)!;
      item.diferenca =
        item.valorInformadoFechamento - item.valorEsperadoFechamento;
    }
    caixa.status = StatusCaixa.FECHADO;
    caixa.dataFechamento = this.dateService.obterDataHoraAtual();
    caixa.idUsuarioFechamento = idUsuario;
    await this.conferenciaRepository.save(caixa.conferencias);
    return this.caixaRepository.save(caixa);
  }
}
