import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configurarSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('AKKAI 3D ERP API')
    .setDescription(
      [
        'API do ERP da AKKAI 3D para autenticação, vendas, produtos, estoque, carteiras, despesas e relatórios operacionais.',
        '',
        'Resumo da API:',
        '- autenticação baseada em cookies HttpOnly com access token curto e refresh token com rotação;',
        '- respostas de erro padronizadas em RFC 7807 no formato application/problem+json;',
        '- recursos de produtos com categorias, estoque mínimo e movimentações de entrada/saída;',
        '- vendas com suporte a itens de catálogo e itens avulsos, incluindo feira e carteira financeira;',
        '- financeiro com carteiras e despesas;',
        '- relatórios operacionais por período, incluindo resumo de vendas e produtos mais vendidos;',
        '- endpoints paginados retornam os campos itens, pagina, tamanhoPagina, totalItens e totalPaginas.',
        '',
        'Autenticação:',
        '- use POST /auth/login para iniciar sessão;',
        '- os cookies access_token e refresh_token são emitidos pela API;',
        '- no Swagger, após autenticar no navegador, os endpoints protegidos podem ser testados usando os mesmos cookies.',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description:
          'Cookie HttpOnly com o access token da sessão autenticada.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'AKKAI 3D ERP API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });
}
