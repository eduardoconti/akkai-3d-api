import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import {
  calcularOffset,
  criarResultadoPaginado,
} from '@common/utils/paginacao.util';
import { PesquisarRevendedoresDto } from '@consignacao/dto';
import { Revendedor } from '@consignacao/entities';
import { StatusRevendedor } from '@consignacao/enums';

@Injectable()
export class RevendedorService {
  private readonly logger = new Logger(RevendedorService.name);

  constructor(
    @InjectRepository(Revendedor)
    private readonly revendedorRepository: Repository<Revendedor>,
  ) {}

  async salvarRevendedor(revendedor: Revendedor): Promise<Revendedor> {
    return this.revendedorRepository.save(revendedor).catch((error) => {
      this.logger.error('Erro ao salvar revendedor', error);
      throw new InternalServerErrorException('Erro ao salvar revendedor');
    });
  }

  async listarRevendedores(
    pesquisa: PesquisarRevendedoresDto,
  ): Promise<ResultadoPaginado<Revendedor>> {
    const where = {
      ...(pesquisa.termo ? { nome: ILike(`%${pesquisa.termo}%`) } : {}),
      ...(pesquisa.status ? { status: pesquisa.status } : {}),
    };
    const orderByMap = {
      nome: { nome: 'ASC' },
      dataInclusao: { dataInclusao: 'DESC' },
    } as const;

    const [itens, totalItens] = await this.revendedorRepository.findAndCount({
      where,
      order: orderByMap[pesquisa.ordenarPor ?? 'nome'],
      skip: calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina),
      take: pesquisa.tamanhoPagina,
    });

    return criarResultadoPaginado(
      itens,
      pesquisa.pagina,
      pesquisa.tamanhoPagina,
      totalItens,
    );
  }

  async obterRevendedorPorId(id: number): Promise<Revendedor | null> {
    return this.revendedorRepository.findOne({ where: { id } });
  }

  async garantirRevendedorPorId(id: number): Promise<Revendedor> {
    const revendedor = await this.obterRevendedorPorId(id);
    if (!revendedor) {
      throw new NotFoundException(`Revendedor com ID ${id} não encontrado`);
    }
    return revendedor;
  }

  async garantirRevendedorAtivo(id: number): Promise<Revendedor> {
    const revendedor = await this.garantirRevendedorPorId(id);
    if (revendedor.status !== StatusRevendedor.ATIVO) {
      throw new NotFoundException(`Revendedor com ID ${id} não está ativo`);
    }
    return revendedor;
  }
}
