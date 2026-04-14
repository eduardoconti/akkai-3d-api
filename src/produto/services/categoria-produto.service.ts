import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaProduto } from '@produto/entities';
import { PesquisarCategoriasDto } from '@produto/dto';
import { ResultadoPaginado } from '@common/interfaces/resultado-paginado.interface';
import { calcularOffset } from '@common/utils/paginacao.util';

@Injectable()
export class CategoriaProdutoService {
  private readonly logger = new Logger(CategoriaProdutoService.name);

  constructor(
    @InjectRepository(CategoriaProduto)
    private readonly categoriaRepository: Repository<CategoriaProduto>,
  ) {}

  async salvarCategoria(
    categoria: CategoriaProduto,
  ): Promise<CategoriaProduto> {
    return this.categoriaRepository.save(categoria).catch((error: unknown) => {
      this.logger.error('Erro ao salvar categoria', error);
      throw new InternalServerErrorException('Erro ao inserir categoria');
    });
  }

  async existeCategoria(idCategoria: number): Promise<boolean> {
    return this.categoriaRepository.exists({ where: { id: idCategoria } });
  }

  async garantirExisteCategoria(id: number): Promise<void> {
    const existe = await this.existeCategoria(id);
    if (!existe) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }
  }

  async listarCategorias(
    pesquisa: PesquisarCategoriasDto,
  ): Promise<ResultadoPaginado<CategoriaProduto>> {
    const termo = pesquisa.termo?.toLowerCase();
    const queryBuilder = this.categoriaRepository
      .createQueryBuilder('categoria')
      .orderBy('categoria.nome', 'ASC')
      .skip(calcularOffset(pesquisa.pagina, pesquisa.tamanhoPagina))
      .take(pesquisa.tamanhoPagina);

    if (termo) {
      queryBuilder.where('LOWER(categoria.nome) LIKE :termo', {
        termo: `%${termo}%`,
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

  async obterCategoriaPorId(id: number): Promise<CategoriaProduto | null> {
    return this.categoriaRepository.findOne({ where: { id } });
  }

  async garantirCategoriaPorId(id: number): Promise<CategoriaProduto> {
    const categoria = await this.obterCategoriaPorId(id);
    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }
    return categoria;
  }

  async excluirCategoria(id: number): Promise<void> {
    await this.categoriaRepository.delete({ id }).catch((error) => {
      this.logger.error('Erro ao excluir categoria', error);
      throw new InternalServerErrorException('Erro ao excluir categoria');
    });
  }
}
