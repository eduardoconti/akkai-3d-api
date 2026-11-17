import { Controller, Get } from '@nestjs/common';
import { ApiProtectedController } from '@common/docs/decorators/api-controller-docs.decorator';
import { ApiListarAlertasDocs } from '@notificacao/docs/notificacao-docs.decorator';
import { ListaAlertasDto } from '@notificacao/dto';
import { ConsultarAlertasUseCase } from '@notificacao/use-cases';

@ApiProtectedController('Notificações')
@Controller('notificacao')
export class NotificacaoController {
  constructor(
    private readonly consultarAlertasUseCase: ConsultarAlertasUseCase,
  ) {}

  /** Qualquer usuário logado; cada alerta é filtrado pela permissão dele. */
  @ApiListarAlertasDocs()
  @Get('alertas')
  async listarAlertas(): Promise<ListaAlertasDto> {
    const alertas = await this.consultarAlertasUseCase.executar();

    return { total: alertas.length, alertas };
  }
}
