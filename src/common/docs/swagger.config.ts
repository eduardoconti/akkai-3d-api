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
        '- autenticação baseada em Bearer token JWT com access token de curta duração e refresh token com rotação;',
        '- respostas de erro padronizadas em RFC 7807 no formato application/problem+json;',
        '- recursos de produtos com categorias, estoque mínimo e movimentações de entrada/saída;',
        '- vendas com suporte a itens de catálogo e itens avulsos, incluindo feira e carteira financeira;',
        '- financeiro com carteiras e despesas;',
        '- relatórios operacionais por período, incluindo resumo de vendas e produtos mais vendidos;',
        '- endpoints paginados retornam os campos itens, pagina, tamanhoPagina, totalItens e totalPaginas.',
        '',
        'Autenticação:',
        '- use POST /auth/login para obter o accessToken e o refreshToken;',
        '- envie o accessToken no cabeçalho Authorization: Bearer <token> em todas as requisições protegidas;',
        '- use POST /auth/refresh com o refreshToken no corpo para renovar a sessão;',
        "- clique em 'Authorize' acima e informe o accessToken para testar os endpoints protegidos no Swagger.",
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token JWT obtido no login ou renovação da sessão.',
      },
      'JWT',
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
