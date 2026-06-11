import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AjusteCarteira } from '@financeiro/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AjusteCarteiraService {
  private readonly logger = new Logger(AjusteCarteiraService.name);

  constructor(
    @InjectRepository(AjusteCarteira)
    private readonly ajusteCarteiraRepository: Repository<AjusteCarteira>,
  ) {}

  async inserirAjusteCarteira(ajuste: AjusteCarteira): Promise<AjusteCarteira> {
    return this.ajusteCarteiraRepository.save(ajuste).catch((error) => {
      this.logger.error('Erro ao inserir ajuste de carteira', error);
      throw new InternalServerErrorException(
        'Erro ao inserir ajuste de carteira',
      );
    });
  }

  async listarAjustesPorCarteira(
    idCarteira: number,
  ): Promise<AjusteCarteira[]> {
    return this.ajusteCarteiraRepository.find({
      where: { idCarteira },
      order: { dataAjuste: 'DESC', id: 'DESC' },
    });
  }
}
