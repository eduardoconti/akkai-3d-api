import { Injectable } from '@nestjs/common';
import { InserirDespesaDto } from '@financeiro/dto';
import { Despesa } from '@financeiro/entities';
import {
  CarteiraService,
  CategoriaDespesaService,
  DespesaService,
} from '@financeiro/services';
import { CurrentUserContext } from '@common/services/current-user-context.service';
import { ConsultaFeira } from '@venda/contracts';

@Injectable()
export class InserirDespesaUseCase {
  constructor(
    private readonly despesaService: DespesaService,
    private readonly carteiraService: CarteiraService,
    private readonly categoriaDespesaService: CategoriaDespesaService,
    private readonly consultaFeira: ConsultaFeira,
    private readonly currentUserContext: CurrentUserContext,
  ) {}

  async execute(input: InserirDespesaDto): Promise<Despesa> {
    await this.carteiraService.garantirExisteCarteira(input.idCarteira);
    await this.categoriaDespesaService.garantirExisteCategoriaDespesa(
      input.idCategoria,
    );
    if (input.idFeira) {
      await this.consultaFeira.garantirExisteFeira(input.idFeira);
    }

    const despesa = Despesa.criar({
      ...input,
      idUsuarioInclusao: this.currentUserContext.usuarioId,
    });

    return this.despesaService.inserirDespesa(despesa);
  }
}
