import { Controller, Get } from '@nestjs/common';
import { Public } from '@auth/decorators/public.decorator';
import { PlanoAssinatura } from '@assinatura/entities';
import { PlanoService, VitrineDto, VitrineService } from '@assinatura/services';
import { ApiPublicController } from '@common/docs/decorators/api-controller-docs.decorator';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiPublicController('Clube Akkai')
@Public()
@Controller('publico/clube-akkai')
export class PublicAssinaturaController {
  constructor(
    private readonly planoService: PlanoService,
    private readonly vitrineService: VitrineService,
  ) {}

  @ApiOperation({ summary: 'Lista os planos de assinatura ativos.' })
  @ApiOkResponse({ description: 'Planos encontrados.' })
  @Get('planos')
  async listarPlanosAtivos(): Promise<PlanoAssinatura[]> {
    return this.planoService.listarPlanosAtivos();
  }

  @ApiOperation({
    summary: 'Retorna os dados da vitrine do Clube Akkai.',
    description:
      'Retorna os planos ativos e o kit mensal marcado como ativo, ' +
      'no formato esperado pelo frontend da landing page.',
  })
  @ApiOkResponse({ description: 'Vitrine montada com sucesso.' })
  @Get('vitrine')
  async obterVitrine(): Promise<VitrineDto> {
    return this.vitrineService.montarVitrine();
  }
}
