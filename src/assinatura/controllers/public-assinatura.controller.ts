import { Controller, Get } from '@nestjs/common';
import { Public } from '@auth/decorators/public.decorator';
import { PlanoAssinatura } from '@assinatura/entities';
import { PlanoService } from '@assinatura/services';
import { ApiPublicController } from '@common/docs/decorators/api-controller-docs.decorator';

@ApiPublicController('Clube Akkai')
@Public()
@Controller('publico/clube-akkai')
export class PublicAssinaturaController {
  constructor(private readonly planoService: PlanoService) {}

  @Get('planos')
  async listarPlanosAtivos(): Promise<PlanoAssinatura[]> {
    return this.planoService.listarPlanosAtivos();
  }
}
