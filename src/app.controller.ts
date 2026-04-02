import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiAppHealthDocs } from './app/docs/app-docs.decorator';

@ApiTags('Aplicação')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiAppHealthDocs()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
