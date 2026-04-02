import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { AppService } from './app.service';
import { ApiAppHealthDocs } from './app/docs/app-docs.decorator';

@ApiTags('Aplicação')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @ApiAppHealthDocs()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
